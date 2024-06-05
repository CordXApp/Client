import type CordX from "../../client/cordx";
import { MessageType, type Message } from "discord.js"

export class Information {
    private client: CordX

    constructor(client: CordX) {
        this.client = client
    }

    public get reactions() {
        return {
            correction: async (message: Message) => {
                if (this.client.help.spellCheck.includes(message.content.toLowerCase())) return message.channel.send({
                    content: 'The correct spelling is CordX!'
                }).then(async (msg: Message) => {
                    await msg.react('<:Amethyst:1243648189815324795>')
                })
            }
        }
    }

    public get send() {
        return {
            help: async (message: Message) => {
                return message.channel.send({
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'CordX: Support Commands',
                            description: 'Are you feeling stuck? These commands might help you out!',
                            color: this.client.config.EmbedColors.warning
                        })
                    ]
                })
            },
            support: async (message: Message) => {
                return message.channel.send({
                    content: message.type === MessageType.Reply ? `${message.mentions.repliedUser}` : `${message.author}`,
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'Information: support',
                            description: `You can head over to the <#1134399965150597240> or <#1201632969845112912> channel and ask for help there. When opening a support ticket or forum please provide the info requested below!`,
                            color: this.client.config.EmbedColors.base,
                            fields: [{
                                name: '👉 What is your issue?',
                                value: 'Please provide a detailed description of whatever it is you need help with.',
                                inline: false
                            }, {
                                name: '👉 What have you tried?',
                                value: 'Have you tried anything to resolve this? If so, what have you tried?',
                                inline: false
                            }, {
                                name: '👉 Additional Information',
                                value: 'Any additional information you think might be helpful (this includes screenshots).',
                                inline: false
                            }]
                        })
                    ]
                })
            },
            docs: async (message: Message) => {
                return message.channel.send({
                    content: message.type === MessageType.Reply ? `${message.mentions.repliedUser}` : `${message.author}`,
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'Information: docs',
                            description: `You can find our documentation [here](https://help.cordx.lol).`,
                            color: this.client.config.EmbedColors.base,
                            fields: [{
                                name: '👉 Domain Blacklist',
                                value: `- [more info](https://help.cordx.lol/docs/users/blacklist)`,
                                inline: false
                            }, {
                                name: '👉 Domain Documentation',
                                value: `- [more info](https://help.cordx.lol/docs/users/domains)`,
                                inline: false
                            }]
                        })
                    ]
                })
            },
            explain: async (message: Message) => {
                return message.reply({
                    content: message.type === MessageType.Reply ? `${message.mentions.repliedUser}` : `${message.author}`,
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'Information: service explanation',
                            description: `So you wanna know more about CordX? Let\'s break it down for you.`,
                            color: this.client.config.EmbedColors.base,
                            fields: [{
                                name: '👉 How it works!',
                                value: 'We use ShareX for direct interaction with our Cloud Storage and Upload API. Users can utilize this to upload a variety of file types, including images, videos, PDFs and more.',
                                inline: false
                            },
                            {
                                name: '👉 Process Breakdown',
                                value: 'Our process is straightforward. ShareX sends a request to our upload API at `cordx.lol/api/upload/sharex`. The API buffers and processes the uploaded file, sends it to our cloud storage, and then returns a link to ShareX. The user can use this link to view the uploaded file.',
                                inline: false
                            }]
                        })
                    ]
                })
            },
            legal: async (message: Message) => {
                return message.channel.send({
                    content: message.type === MessageType.Reply ? `${message.mentions.repliedUser}` : `${message.author}`,
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'Information: legal stuff',
                            description: `You can find our legal documents below.`,
                            color: this.client.config.EmbedColors.base,
                            fields: [{
                                name: '👉 Terms of Service',
                                value: `- [cordximg.host/legal/terms](https://cordximg.host/legal/terms)`,
                                inline: false
                            }, {
                                name: '👉 Privacy Policy',
                                value: `- [cordximg.host/legal/privacy](https://cordximg.host/legal/privacy)`,
                                inline: false
                            }, {
                                name: '👉 Use License',
                                value: `- [cordximg.host/legal/license](https://cordximg.host/legal/license)`,
                            }]
                        })
                    ]
                })
            }
        }
    }
}