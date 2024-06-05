import { ButtonBuilder, ButtonStyle } from "discord.js"

export class CordXButtons extends ButtonBuilder {
    constructor(data: {
        user: string;
        style: ButtonStyle
        label: string
        customId: string
        disabled?: boolean
        emoji?: string
        url?: string
    }) {
        super()

        this.setStyle(data.style)
        this.setLabel(data.label)
        this.setCustomId(data.customId)
        if (data.disabled) this.setDisabled(data.disabled)
        if (data.emoji) this.setEmoji(data.emoji)
        if (data.url) this.setURL(data.url)
    }
}
