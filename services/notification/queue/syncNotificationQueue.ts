import {
  NotificationDispatcher,
  type DispatchNotificationInput,
  type DispatchNotificationResult,
} from "../dispatcher";

export interface NotificationQueue {
  enqueue(
    input: DispatchNotificationInput,
  ): Promise<DispatchNotificationResult>;
}

export class SyncNotificationQueue implements NotificationQueue {
  constructor(
    private readonly dispatcher: NotificationDispatcher = new NotificationDispatcher(),
  ) {}

  async enqueue(
    input: DispatchNotificationInput,
  ): Promise<DispatchNotificationResult> {
    return this.dispatcher.dispatch(input);
  }
}
