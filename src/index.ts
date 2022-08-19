export class TryError extends Error {}
export class CheckpointError extends Error {}

export interface checkpointOptions<FailureReturnType> {
  retries?: number;
  logger?: (arg0: string) => void;
  name?: string;
  onRetry?: () => void | Promise<void>;
  onFailure?: () => FailureReturnType | Promise<FailureReturnType>;
}

export function retry(checkpointName?: string): void {
  throw new TryError(checkpointName);
}

export async function checkpoint<ReturnType, FailureReturnType>(
  options: checkpointOptions<FailureReturnType> = {},
  func: () => ReturnType | Promise<ReturnType>
): Promise<ReturnType | FailureReturnType> {
  const {
    retries = 1,
    logger = null,
    name = null,
    onRetry = () => {
      return;
    },
    onFailure = () => {
      throw new CheckpointError(`Checkpoint failed after ${retries} retries`);
    },
  } = options;

  logger?.('Checkpoint registered');
  for (let i = 0; i <= retries; i++) {
    logger?.(`Try number i: ${i}`);
    try {
      const result = await func();
      logger?.('Checkpoint passed');
      return result;
    } catch (error) {
      if (isRetryableError(error, name)) {
        logger?.(`Try number i: ${i} failed`);
        await onRetry();
        continue;
      }
      throw error;
    }
  }

  return onFailure();
}

function isRetryableError(error: any, checkpointName: string | null): boolean {
  return (
    error instanceof TryError &&
    (error.message === checkpointName || error.message === '')
  );
}
