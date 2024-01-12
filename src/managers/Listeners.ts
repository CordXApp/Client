import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type CordX from '../client/CordX';
import type { IEvent } from '../types/utils.interface';

class EventManager {
    public client: CordX;

    constructor(client: CordX) {
        this.client = client;
    }

    public load(dir: string): void {
        readdirSync(dir).forEach(async (file: string): Promise<void> => {
          const eventInstance = await import(join(dir, file));
          const event: IEvent = new eventInstance.default;
    
          if (event.props.once) {
            this.client.once(event.props.name, (...args) => event.execute(this.client, ...args));
            return;
          }
    
          this.client.on(event.props.name, (...args) => event.execute(this.client, ...args));
        });
    }
}

export default EventManager