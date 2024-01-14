import type { IEventBaseProps } from "src/types/utilities"

class EventBase {
    public props: IEventBaseProps

    constructor(props: IEventBaseProps) {
        this.props = props
    }
}

export default EventBase
