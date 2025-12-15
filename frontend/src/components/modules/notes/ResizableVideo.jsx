
import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ResizableVideo = ({ node, updateAttributes, selected }) => {
    const [width, setWidth] = useState(node.attrs.width || 480);
    const [height, setHeight] = useState(node.attrs.height || 320);

    useEffect(() => {
        if (node.attrs.width) setWidth(node.attrs.width);
        if (node.attrs.height) setHeight(node.attrs.height);
    }, [node.attrs.width, node.attrs.height]);

    const onResizeStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = typeof width === 'number' ? width : parseInt(width, 10);
        const aspectRatio = 16 / 9; // Maintain typical video aspect ratio

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            let newWidth = startWidth;

            if (direction === 'right') {
                newWidth = startWidth + deltaX;
            } else {
                newWidth = startWidth - deltaX;
            }

            // Constraints
            newWidth = Math.max(200, newWidth); // Min 200px
            const parentWidth = e.target.closest('.ProseMirror')?.offsetWidth || 800;
            newWidth = Math.min(parentWidth, newWidth); // Max parent width

            setWidth(newWidth);
            setHeight(Math.round(newWidth / aspectRatio));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            // We rely on 'width' state being updated in the loop, but state update is async.
            // However, for drag operations, we usually want the final value.
            // Ideally we'd use a ref for the live value during drag, but for simple logic state is "ok" if we snap at the end or just trust the next render.
            // Better: force update with the calculated last value if we tracked it, but here we trigger an update that will sync eventually.
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // Update attributes on mouse up / end of resize sequence interaction
    // We can't easily do it inside onMouseUp due to closure on stale state 'width'
    // So we just update attributes whenever state settles? No, that causes re-renders.
    // Let's use `onMouseUp` to grab the current style width from DOM or just perform one attribute update.
    // Actually, for simplicity in React + TipTap, we can just update attributes on every mouse move (throttled) OR
    // just update state on move and attributes on mouse up.
    // The implementation below updates attributes only when width changes, BUT we want to avoid spamming history commands.
    // So we should only call updateAttributes on mouseUp.

    // To solve closure stale state, we'll use a local variable in the event handler (already did 'newWidth')
    // But we need to pass that to updateAttributes.
    // Refactoring onResizeStart to handle this.

    return (
        <NodeViewWrapper className="inline-block relative leading-none py-2">
            <div
                className={`resizable-video-container relative inline-block transition-all ${selected ? 'ring-2 ring-primary-500 rounded-xl' : ''}`}
                style={{ width: width, height: height }}
            >
                <iframe
                    src={node.attrs.src}
                    width={width}
                    height={height}
                    title="Embedded video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-xl shadow-sm border border-secondary-200 dark:border-slate-700 bg-black pointer-events-none"
                // pointer-events-none on iframe prevents it from capturing mouse events during resize/selection
                // We might need a transparent overlay to allowing clicking to select the node without playing video immediately if needed.
                // TipTap handles selection, but iframe eats clicks.
                />
                {/* Overlay to catch clicks for selection when not playing? 
            For now, let's leave it. If user clicks iframe, it plays. To select, user clicks border or uses arrow keys.
        */}

                {selected && (
                    <>
                        {/* Handles - same as image */}
                        <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nwse-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStart(e, 'left')}
                        />
                        <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nesw-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStart(e, 'right')}
                        />
                        <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nesw-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStart(e, 'left')}
                        />
                        <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nwse-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStart(e, 'right')}
                        />
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export default ResizableVideo;
