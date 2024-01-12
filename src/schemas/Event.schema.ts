import type { IEventBaseProps } from 'src/types/utils.interface';

class EventBase {
  public props: IEventBaseProps;

  constructor(props: IEventBaseProps) {
    this.props = props;
  }
}

export default EventBase;