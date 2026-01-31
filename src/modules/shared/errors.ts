export class PipelineError extends Error {
    constructor(message: string, public readonly context?: Record<string, unknown>) {
        super(message);
        this.name = "PipelineError";
    }
}

export class ContentFetchError extends PipelineError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, context);
        this.name = "ContentFetchError";
    }
}

export class RenderingError extends PipelineError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, context);
        this.name = "RenderingError";
    }
}

export class UploadError extends PipelineError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, context);
        this.name = "UploadError";
    }
}

export class DistributionError extends PipelineError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, context);
        this.name = "DistributionError";
    }
}
