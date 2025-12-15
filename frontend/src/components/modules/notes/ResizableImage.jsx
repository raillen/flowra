
import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ResizableImage = ({ node, updateAttributes, selected }) => {
    const [width, setWidth] = useState(node.attrs.width || '100%');

    useEffect(() => {
        if (node.attrs.width) {
            setWidth(node.attrs.width);
        }
    }, [node.attrs.width]);

    const onResizeStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const container = e.target.closest('.resizable-image-container');
        if (!container) return;

        const startWidth = container.offsetWidth;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            let newWidth = startWidth;

            if (direction === 'right') {
                newWidth = startWidth + deltaX;
            } else {
                newWidth = startWidth - deltaX;
            }

            // Constraints
            newWidth = Math.max(100, newWidth); // Min 100px
            const proseMirror = e.target.closest('.ProseMirror');
            if (proseMirror) {
                const parentWidth = proseMirror.offsetWidth;
                newWidth = Math.min(parentWidth, newWidth); // Max parent width
            }

            setWidth(`${newWidth}px`);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            // We need to use the current width value for update. 
            // Since state update might be async, we can't just use 'width' variable from closure easily if it was stale.
            // But we are setting state on mouse move, so 'width' in this closure is definitely stale (start value).
            // We should calculate final width again or rely on a Ref to store it.
            // For simplicity, let's just trigger another state update that also syncs? 
            // Actually, better to use a ref to track current width during resize.
        };

        // We need to sync width to attributes at the end.
        // Let's modify onMouseMove to update a Ref, and onMouseUp to read that Ref.

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // Refactor to use Ref for live width to ensure correct final value save
    const widthRef = useRef(width);
    useEffect(() => { widthRef.current = width; }, [width]);

    const onResizeStartImproved = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = e.target.closest('.resizable-image-container').offsetWidth;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            let newWidth = startWidth;

            if (direction === 'right') {
                newWidth = startWidth + deltaX;
            } else {
                newWidth = startWidth - deltaX;
            }

            newWidth = Math.max(100, newWidth);
            const proseMirror = e.target.closest('.ProseMirror');
            if (proseMirror) {
                newWidth = Math.min(proseMirror.offsetWidth, newWidth);
            }

            const newWidthStr = `${newWidth}px`;
            setWidth(newWidthStr);
            widthRef.current = newWidthStr;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            updateAttributes({ width: widthRef.current });
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <NodeViewWrapper className="inline-block relative leading-none py-2">
            <div
                className={`resizable-image-container relative inline-block transition-all ${selected ? 'ring-2 ring-primary-500 rounded-lg' : ''}`}
                style={{ width: width, maxWidth: '100%' }}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    className="block w-full h-auto rounded-lg shadow-sm border border-secondary-200 dark:border-slate-700"
                />

                {selected && (
                    <>
                        <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nwse-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStartImproved(e, 'left')}
                        />
                        <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nesw-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStartImproved(e, 'right')}
                        />
                        <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nesw-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStartImproved(e, 'left')}
                        />
                        <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary-600 border border-white rounded-full cursor-nwse-resize z-20 shadow-sm"
                            onMouseDown={(e) => onResizeStartImproved(e, 'right')}
                        />
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export default ResizableImage;
