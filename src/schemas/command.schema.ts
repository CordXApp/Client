import { ISlashCommandProps } from "../types/client/commands"

export class SlashBase {
    public props: ISlashCommandProps

    constructor(props: ISlashCommandProps) {
        this.props = props
    }
}
