'use client';

import React, { useState } from 'react';
import { Button, Modal, LoadingSpinner, ErrorMessage } from './index';

const ComponentDemo: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleLoadingDemo = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">UI Components Demo</h2>
                <p className="text-neutral-600">Showcasing the Figma-designed UI components</p>
            </div>

            {/* Button Variants */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Button Components</h3>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg">Large</Button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button variant="primary" loading={isLoading} onClick={handleLoadingDemo}>
                        {isLoading ? 'Loading...' : 'Test Loading'}
                    </Button>
                    <Button variant="outline" disabled>Disabled Button</Button>
                </div>
            </div>

            {/* Modal Demo */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Modal Component</h3>
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                    Open Modal
                </Button>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Demo Modal"
                    size="md"
                >
                    <div className="space-y-4">
                        <p className="text-neutral-600">
                            This is a demo modal with Figma design patterns including backdrop blur,
                            shadows, and smooth animations.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="primary" size="sm">Confirm</Button>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>

            {/* Loading Spinner Demo */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Loading Spinner Components</h3>
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <LoadingSpinner size="sm" />
                        <p className="text-sm text-neutral-600 mt-2">Small</p>
                    </div>
                    <div className="text-center">
                        <LoadingSpinner size="md" />
                        <p className="text-sm text-neutral-600 mt-2">Medium</p>
                    </div>
                    <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-sm text-neutral-600 mt-2">Large</p>
                    </div>
                    <div className="text-center">
                        <LoadingSpinner size="xl" />
                        <p className="text-sm text-neutral-600 mt-2">Extra Large</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <LoadingSpinner color="primary" />
                        <p className="text-sm text-neutral-600 mt-2">Primary</p>
                    </div>
                    <div className="text-center">
                        <LoadingSpinner color="secondary" />
                        <p className="text-sm text-neutral-600 mt-2">Secondary</p>
                    </div>
                    <div className="text-center">
                        <LoadingSpinner color="accent" />
                        <p className="text-sm text-neutral-600 mt-2">Accent</p>
                    </div>
                </div>
            </div>

            {/* Error Message Demo */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Error Message Components</h3>

                <ErrorMessage
                    title="Error Example"
                    message="This is an example error message with Figma styling and retry functionality."
                    variant="error"
                    onRetry={() => console.log('Retry clicked')}
                    onDismiss={() => setShowError(false)}
                />

                <ErrorMessage
                    title="Warning Example"
                    message="This is a warning message with custom styling."
                    variant="warning"
                    showIcon={true}
                />

                <ErrorMessage
                    message="This is an info message without a title."
                    variant="info"
                    size="sm"
                />
            </div>
        </div>
    );
};

export default ComponentDemo;