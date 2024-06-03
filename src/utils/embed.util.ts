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
                : "https://cdn.discordapp.com/attachments/1132817220611866745/1243642520030937098/IMG_5430.png?ex=6658cf5a&is=66577dda&hm=58fd8240fe3ac8f0207613ee4696615b0fd85e266e06426a4331ca7e71cc77f8&",
        )
        this.setColor(data.color)
        if (data.fields) this.setFields(data.fields)
        this.setTimestamp()
        this.setFooter(
            data.footer
                ? data.footer
                : {
                    text: `© Copyright 2023 - CordX v${version}`,
                    iconURL: "https://cdn.discordapp.com/attachments/1132817220611866745/1243642520030937098/IMG_5430.png?ex=6658cf5a&is=66577dda&hm=58fd8240fe3ac8f0207613ee4696615b0fd85e266e06426a4331ca7e71cc77f8&",
                }
        )
    }
}
