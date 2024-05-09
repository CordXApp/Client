import type { IEventBaseProps } from "src/types/client/utilities"

class EventBase {
    public props: IEventBaseProps

    constructor(props: IEventBaseProps) {
        this.props = props
    }
}

export default EventBase
