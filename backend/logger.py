"""
Async logging utility for streaming real-time logs to frontend.
Uses asyncio.Queue for thread-safe log message passing.
"""

import asyncio
import json
from typing import AsyncGenerator
from contextvars import ContextVar

# Context variable to hold the current log queue
log_queue_var: ContextVar[asyncio.Queue] = ContextVar('log_queue', default=None)


def get_log_queue() -> asyncio.Queue:
    """Get the current log queue from context."""
    queue = log_queue_var.get()
    if queue is None:
        raise RuntimeError("No log queue in context. Ensure you're running within a streaming context.")
    return queue


def set_log_queue(queue: asyncio.Queue) -> None:
    """Set the log queue in context."""
    log_queue_var.set(queue)


async def log_message(content: str, log_type: str = "log", step: str = "") -> None:
    """
    Send a log message to the queue.
    
    Args:
        content: The log message content
        log_type: Type of message ("log", "node", "result", "error")
        step: Current workflow step ("analyze", "fetch", "synthesize")
    """
    queue = log_queue_var.get()
    if queue is not None:
        data = {"type": log_type, "content": content}
        if step:
            data["step"] = step
        message = json.dumps(data)
        await queue.put(message)


def log_message_sync(content: str, log_type: str = "log", step: str = "") -> None:
    """
    Synchronous version of log_message for use in sync functions.
    Creates a new event loop task to put the message.
    
    Args:
        content: The log message content
        log_type: Type of message ("log", "node", "result", "error")
        step: Current workflow step ("analyze", "fetch", "synthesize")
    """
    queue = log_queue_var.get()
    if queue is not None:
        data = {"type": log_type, "content": content}
        if step:
            data["step"] = step
        message = json.dumps(data)
        try:
            # Try to put without blocking
            queue.put_nowait(message)
        except asyncio.QueueFull:
            pass  # Skip if queue is full


async def send_node_status(node: str, status: str, message: str = "") -> None:
    """
    Send a node status update.
    
    Args:
        node: The node name (analyze, fetch, synthesize)
        status: Status (running, complete)
        message: Optional status message
    """
    queue = log_queue_var.get()
    if queue is not None:
        data = json.dumps({
            "type": "node",
            "node": node,
            "status": status,
            "message": message
        })
        await queue.put(data)


def send_node_status_sync(node: str, status: str, message: str = "") -> None:
    """Synchronous version of send_node_status."""
    queue = log_queue_var.get()
    if queue is not None:
        data = json.dumps({
            "type": "node",
            "node": node,
            "status": status,
            "message": message
        })
        try:
            queue.put_nowait(data)
        except asyncio.QueueFull:
            pass


async def send_result(payload: dict) -> None:
    """
    Send the final result.
    
    Args:
        payload: The final JSON result
    """
    queue = log_queue_var.get()
    if queue is not None:
        data = json.dumps({
            "type": "result",
            "payload": payload
        })
        await queue.put(data)
        # Signal completion
        await queue.put(None)


def send_result_sync(payload: dict) -> None:
    """Synchronous version of send_result."""
    queue = log_queue_var.get()
    if queue is not None:
        data = json.dumps({
            "type": "result",
            "payload": payload
        })
        try:
            queue.put_nowait(data)
            queue.put_nowait(None)  # Signal completion
        except asyncio.QueueFull:
            pass


async def event_generator(queue: asyncio.Queue) -> AsyncGenerator[str, None]:
    """
    Async generator that yields SSE-formatted events from the queue.
    
    Args:
        queue: The asyncio.Queue containing log messages
        
    Yields:
        SSE-formatted strings
    """
    while True:
        try:
            message = await asyncio.wait_for(queue.get(), timeout=60.0)
            
            if message is None:
                # End of stream
                yield "data: {\"type\": \"done\"}\n\n"
                break
                
            yield f"data: {message}\n\n"
            
        except asyncio.TimeoutError:
            # Send keepalive
            yield "data: {\"type\": \"keepalive\"}\n\n"
        except Exception as e:
            yield f"data: {{\"type\": \"error\", \"content\": \"{str(e)}\"}}\n\n"
            break
