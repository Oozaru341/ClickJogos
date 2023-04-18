"use strict";

const MaxHeadroom = 0xffffffff;

export class Scheduler {
    constructor() {
        this.scheduled = null;
        this.epoch = 0;
    }

    schedule(task, delay) {
        if (task.scheduler !== this) {
            throw new Error("Wrong scheduler for task, or non-task");
        }
        if (task.scheduled()) {
            throw new Error("Task is already scheduled");
        }

        const expireEpoch = delay + this.epoch;
        task.expireEpoch = expireEpoch;
        task._scheduled = true;

        let before = this.scheduled;
        let prev = null;
        while (before && before.expireEpoch <= expireEpoch) {
            prev = before;
            before = before.next;
        }
        task.next = before;
        task.prev = prev;
        if (task.next) task.next.prev = task;
        if (task.prev) {
            task.prev.next = task;
        } else {
            this.scheduled = task;
        }
    }

    cancel(task) {
        if (!task.scheduled()) return;
        if (!task.prev) {
            // First element, we need to update the head element.
            this.scheduled = task.next;
        } else {
            task.prev.next = task.next;
        }
        if (task.next) {
            task.next.prev = task.prev;
        }
        task.next = task.prev = null;
        task._scheduled = false;
    }

    polltime(ticks) {
        const targetEpoch = this.epoch + ticks;
        while (this.scheduled && this.scheduled.expireEpoch <= targetEpoch) {
            const head = this.scheduled;
            this.epoch = head.expireEpoch;
            head.cancel(); // cancel first
            head.onExpire(); // expiry may reschedule
        }
        this.epoch = targetEpoch;
    }

    headroom() {
        if (this.scheduled === null) return MaxHeadroom;
        return this.scheduled.expireEpoch - this.epoch;
    }

    newTask(onExpire) {
        return new Task(this, onExpire);
    }
}

class Task {
    constructor(scheduler, onExpire) {
        this.scheduler = scheduler;
        this.prev = this.next = null;
        this.expireEpoch = 0;
        this.onExpire = onExpire;
        this._scheduled = false;
    }

    scheduled() {
        return this._scheduled;
    }

    schedule(delay) {
        this.scheduler.schedule(this, delay);
    }

    reschedule(delay) {
        this.scheduler.cancel(this);
        this.scheduler.schedule(this, delay);
    }

    cancel() {
        this.scheduler.cancel(this);
    }

    ensureScheduled(state, delay) {
        if (state) {
            if (!this.scheduled()) this.schedule(delay);
        } else {
            this.cancel();
        }
    }
}
