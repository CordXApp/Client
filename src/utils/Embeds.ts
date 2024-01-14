import { EmbedBuilder, HexColorString, EmbedField } from "discord.js"

/**
 * @file EmbedBuilder - EmbedBuilder class
 */
export class CordxEmbed extends EmbedBuilder {
    /**
     * @param {string} title - Embed's title
     * @param {string} description - Embed's description
     * @param {string} color - Embed's color
     */
    constructor(data: {
        title: string
        description: string
        thumbnail?: string
        color: HexColorString
        fields?: EmbedField[]
    }) {
        super()

        this.setTitle(data.title)
        this.setDescription(data.description)
        this.setThumbnail(
            data.thumbnail
                ? data.thumbnail
                : "https://cordx.lol/assets/loggo.png",
        )
        this.setColor(data.color)
        if (data.fields) this.setFields(data.fields)
        this.setTimestamp()
        this.setFooter({
            text: "© Copyright 2023 - CordX",
            iconURL: "https://cordx.lol/assets/loggo.png",
        })
    }
}
