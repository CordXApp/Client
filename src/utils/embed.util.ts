import { EmbedBuilder, HexColorString, EmbedField, EmbedAuthorOptions, EmbedFooterOptions } from "discord.js"
import { version } from "../../package.json";

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
        image?: string
        thumbnail?: string
        color: HexColorString
        fields?: EmbedField[]
        author?: EmbedAuthorOptions
        hideTimestamp?: boolean;
        footer?: EmbedFooterOptions
    }) {
        super()

        this.setTitle(data.title)
        this.setDescription(data.description)
        if (data.image) this.setImage(data.image)
        if (data.author) this.setAuthor({
            name: data.author.name,
            iconURL: data.author.iconURL,
            url: data.author.url
        })
        this.setThumbnail(
            data.thumbnail
                ? data.thumbnail
                : "https://cdn.cordx.space/assets/logo-trans-white.png",
        )
        this.setColor(data.color)
        if (data.fields) this.setFields(data.fields)
        if (data.hideTimestamp === false) this.setTimestamp()
        this.setFooter(
            data.footer
                ? {
                    text: data.footer + ` © CordX v${version}`,
                    iconURL: "https://cdn.cordx.space/assets/logo-trans-white.png"
                }
                : {
                    text: `© Copyright 2023 - CordX v${version}`,
                    iconURL: "https://cdn.cordx.space/assets/logo-trans-white.png",
                }
        )
    }
}
