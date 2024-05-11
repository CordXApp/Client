import { MessageType, AttachmentBuilder } from 'discord.js';
import type { Message } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../cordx"

export default class MessageCreate extends EventBase {
    constructor() {
        super({ name: "messageCreate" })
    }

    public async execute(
        client: CordX,
        message: Message,
    ): Promise<any> {

        if (message.author.bot) return;
        if (!message.guild || message.guild.id !== '871204257649557604') return;

        let prefix: string = client.help.prefix;
        let author = message.author;

        if (!message.content.startsWith(prefix) && client.help.spellCheck.includes(message.content.toLowerCase())) {
            await message.react('<:CordX_New:1134760288755920966>')

            return message.reply('The correct spelling is `CordX`!');
        } else if (!message.content.startsWith(prefix)) return;

        if (message.content.includes('CordX')) return message.react('<:CordX_New:1134760288755920966>');

        if (message.content.startsWith(prefix + 'help') || message.content.startsWith(prefix + 'h')) return message.channel.send('There is no help for you chief!');

        if (message.content.startsWith(prefix + 'support') || message.content.startsWith(prefix + 'sp')) return message.channel.send({
            content: message.type === MessageType.Reply ? `${message.mentions.repliedUser} so you need support hey? You can head over to the <#1134399965150597240> or <#1201632969845112912> channel and ask for help there!\n***NOTE: the "public" support channel can be seen and responded to by all members of the CordX Server.***` : `${author} so you need support hey? You can head over to the <#1134399965150597240> or <#1201632969845112912> channel and ask for help there!\n***NOTE: the "public" support channel can be seen and responded to by all members of the CordX Server.***`,
        })

        if (message.content.startsWith(prefix + 'docs') || message.content.startsWith(prefix + 'doc')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} you can find the documentation for CordX [here](https://help.cordx.lol).\n\n## 👉 EXTRAS:\n- [blacklist docs](<https://help.cordx.lol/docs/users/blacklist>)\n- [domain docs](<https://help.cordx.lol/docs/users/domains>)` :
                `${author} you can find the documentation for CordX [here](https://help.cordx.lol).\n\n## 👉 EXTRAS:\n- [blacklist docs](<https://help.cordx.lol/docs/users/blacklist>)\n- [domain docs](<https://help.cordx.lol/docs/users/domains>)`,
        })

        if (message.content.startsWith(prefix + 'explain') || message.content.startsWith(prefix + 'exp')) return message.channel.send({
            content: message.type === MessageType.Reply ? `${message.mentions.repliedUser}` : `${author}`,
            embeds: [
                new client.EmbedBuilder({
                    title: 'CordX: Service Explanation',
                    description: 'So you wanna know more about CordX? Let\'s break it down for you.',
                    color: client.config.EmbedColors.base,
                    fields: [
                        {
                            name: '👉 How it works!',
                            value: 'we utilize ShareX to allow users to interact with our `Cloud Storage` and `Upload API` directly, users can upload anything from Images to PDF Files you can even store your code here if you absolutely want to.',
                            inline: false
                        },
                        {
                            name: '👉 Process Breakdown',
                            value: 'our process is pretty straight forward, `ShareX` sends a request to our upload api `cordx.lol/api/upload/sharex` our api is then responsible for buffering and processing the uploaded image or file, sending it to our cloud storage and then finally sending `ShareX` back a link that the user can use to view the image/file/whatever.',
                            inline: false
                        }
                    ]
                })
            ]
        })

        if (message.content.startsWith(prefix + 'terms') || message.content.startsWith(prefix + 'tos')) {
            const attachment = new AttachmentBuilder('https://cdn.discordapp.com/attachments/1203076183403667456/1204224398995759104/IMG_0517.png?ex=65d3f45e&is=65c17f5e&hm=8368281afaf32e95868a38b7659ff61ef55db8e8d2a8fece2d83a7d606390054&');
            return message.channel.send({
                content: message.type === MessageType.Reply ? `${message.mentions.repliedUser} you should read our [terms of service](<https://cordx.lol/legal/terms>)` : `${author} you should read our [terms of service](<https://cordx.lol/legal/terms>)`,
                files: [attachment]
            });
        }

        if (message.content.startsWith(prefix + 'sharex') || message.content.startsWith(prefix + 'sx')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} ShareX is a free and open source program that lets you capture or record any area of your screen and share it with a single press of a key. It also allows uploading images, text or other types of files to many supported destinations you can choose from.\n\n## 👉 Download ShareX\nYou can download ShareX from their official website [here](https://getsharex.com/) if you need to.\n## 👉 Important Info\nShareX currently only supports the \`Windows\` operating system.` :
                `${author} ShareX is a free and open source program that lets you capture or record any area of your screen and share it with a single press of a key. It also allows uploading images, text or other types of files to many supported destinations you can choose from.\n\n## 👉 Download ShareX\nYou can download ShareX from their official website [here](https://getsharex.com/) if you need to.\n## 👉 Important Info\nShareX currently only supports the \`Windows\` operating system.`,
        })

        if (message.content.startsWith(prefix + 'config') || message.content.startsWith(prefix + 'cfg')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} you can manage your CordX/ShareX config by using the \`/config\` command. You can view your config, download it and even view the help menu.` :
                `${author} you can manage your CordX/ShareX config by using the \`/config\` command. You can view your config, download it and even view the help menu.`,
        })

        if (message.content.startsWith(prefix + 'linux') || message.content.startsWith(prefix + 'lin')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} ShareX currently only supports the \`Windows\` operating system which may limit our reach and abilities however we as a service are working on porting support for other operating systems and platforms with our Application. More updates will be provided here: <#871274527471042630> and on [x/twitter](<https://x.com/HeyCordX>) in the future.` :
                `${author} ShareX currently only supports the \`Windows\` operating system which may limit our reach and abilities however we as a service are working on porting support for other operating systems and platforms with our Application. More updates will be provided here: <#871274527471042630> and on [x/twitter](<https://x.com/HeyCordX>) in the future.`,
        })

        if (message.content.startsWith(prefix + 'moreinfo') || message.content.startsWith(prefix + 'mi')) {
            const attachment = new AttachmentBuilder('https://cdn.discordapp.com/attachments/1132817220611866745/1204243838261010442/IMG_3865.png?ex=65d40678&is=65c19178&hm=3693414c5342efb559b8529216ee2f5c4dbceb99d4e3d55849c967725d686e2b&');
            return message.channel.send({
                content: message.type === MessageType.Reply ? `${message.mentions.repliedUser} ***please provide as much information regarding your issue as possible***` : `***please provide as much information regarding your issue as possible***`,
                files: [attachment]
            });
        }

        if (message.content.startsWith(prefix + 'fullscreen') || message.content.startsWith(prefix + 'full')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} Please provide a ***FULL SCREENSHOT OR VIDEO*** of your issue or error message, this will help us to better understand and assist you.\n⚠️ This means literally the entire screen, do not erase, censor or crop anything out\n⚠️ Include the URL at the top of the browser and the clock at the bottom of your screen.\n⚠️ Include the developer tools console (if using chrome) or any similar tool if you are using a different browser.` :
                `Please provide a ***FULL SCREENSHOT OR VIDEO*** of your issue or error message, this will help us to better understand and assist you.\n⚠️ This means literally the entire screen, do not erase, censor or crop anything out\n⚠️ Include the URL at the top of the browser and the clock at the bottom of your screen.\n⚠️ Include the developer tools console (if using chrome) or any similar tool if you are using a different browser.`,
        })

        if (message.content.startsWith(prefix + 'screenshot') || message.content.startsWith(prefix + 'ss')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} you can capture your screen using: \`Ctrl + PrtScn\` or \`Alt + PrtScn\` you will then be provided with a url that you can paste to share the image.` :
                `You can capture your screen using: \`Ctrl + PrtScn\` or \`Alt + PrtScn\` you will then be provided with a url that you can paste to share the image.`,
        })

        if (message.content.startsWith(prefix + 'cordx') || message.content.startsWith(prefix + 'cx')) return message.channel.send({
            content: `<:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966>\n<:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966>\n<:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966><:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966>\n<:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966>\n<:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966> <:CordX_New:1134760288755920966>\n`
        })

        if (message.content.startsWith(prefix + 'invaliddns') || message.content.startsWith(prefix + 'idns')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} the **Invalid Configuration** error found in our verification process simply means that we are unable to validate your \`TXT\` record at this time.\n## 👉 How to fix\n- in most cases this process just takes some time, you can keep hitting the bouncing red "refresh" button until it says verified or if you believe something is wrong then ensure the information you provided in your DNS Records matches the information found in the [/verify](${client.help.images.domValidation}) page.` :
                `${author} the **Invalid Configuration** error found in our verification process simply means that we are unable to validate your \`TXT\` record at this time.\n## 👉 How to fix\n- in most cases this process just takes some time, you can keep hitting the bouncing red "refresh" button until it says verified or if you believe something is wrong then ensure the information you provided in your DNS Records matches the information found in the [/verify](${client.help.images.domValidation}) page.`,
        })

        if (message.content.startsWith(prefix + 'setup') || message.content.startsWith(prefix + 'su')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} Setting up CordX is pretty simple, let me guide you through it.\n\n## 👉 Setup Guide\n- 1️⃣ Head over to our [website](<https://cordx.lol>) and login if you aren\'t already.\n- 2️⃣ Inside the user navigation (click your avatar) find and click the config button to download your CordX/ShareX Config\n- 3️⃣ Open the new \`CordX.sxcu\` in a code editor of your choice (notepad works too).\n- 4️⃣ Change the \`Name\` field from CordX to something that will make it easier for you to identify inside ShareX.\n- 5️⃣ If you have added/verified a custom domain and want to use it change the \`RequestURL\` field to match your domain (**DO NOT REMOVE THE API ENDPOINT**)\n- 6️⃣ Save your changes to the config and then Double Click the \`CordX.sxcu\` file, if you have ShareX installed (at this point you should) you will get a prompt to set this config as the active custom uploader, click yes when you get this prompt.\n- 7️⃣ That\'s it now you can use \`Ctrl + PrtScn\` or \`Alt + PrtScn\` to upload screenshots from your computer to CordX and receive a link to share it with the world.\n\n## 👉 Additional Info\n- You can also get your config by using the \`/config\` command.\n- \`RequestURL\` should always contain the **/api/upload/sharex** endpoint.\n- \`Name\` field is what the config will be named in ShareX.` :
                `${author} Setting up CordX is pretty simple, let me guide you through it.\n\n## 👉 Setup Guide\n- 1️⃣ Head over to our [website](<https://cordx.lol>) and login if you aren\'t already.\n- 2️⃣ Inside the user navigation (click your avatar) find and click the config button to download your CordX/ShareX Config\n- 3️⃣ Open the new \`CordX.sxcu\` in a code editor of your choice (notepad works too).\n- 4️⃣ Change the \`Name\` field from CordX to something that will make it easier for you to identify inside ShareX.\n- 5️⃣ If you have added/verified a custom domain and want to use it change the \`RequestURL\` field to match your domain (**DO NOT REMOVE THE API ENDPOINT**)\n- 6️⃣ Save your changes to the config and then Double Click the \`CordX.sxcu\` file, if you have ShareX installed (at this point you should) you will get a prompt to set this config as the active custom uploader, click yes when you get this prompt.\n- 7️⃣ That\'s it now you can use \`Ctrl + PrtScn\` or \`Alt + PrtScn\` to upload screenshots from your computer to CordX and receive a link to share it with the world.\n\n## 👉 Additional Info\n- You can also get your config by using the \`/config\` command.\n- \`RequestURL\` should always contain the **/api/upload/sharex** endpoint.\n- \`Name\` field is what the config will be named in ShareX.`,
        })

        if (message.content.startsWith(prefix + 'verify') || message.content.startsWith(prefix + 'v')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} you can verify your domain by following the instructions found at \`https://cordx.lol/verify?domainName=img.example.com\`` :
                `${author} you can verify your domain by following the instructions found at \`https://cordx.lol/verify?domainName=img.example.com\``,
        })

        if (message.content.startsWith(prefix + 'directmessage') || message.content.startsWith(prefix + 'dm')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} to help keep everyone safe and on the same page, we ask that you keep all support related questions in the public channels and do not communicate via DMs. This allows everyone to see the questions and answers and can help others with similar issues.` :
                `${author} to help keep everyone safe and on the same page, we ask that you keep all support related questions in the public channels and do not communicate via DMs. This allows everyone to see the questions and answers and can help others with similar issues.`,
        })

        if (message.content.startsWith(prefix + 'uploadfailed') || message.content.startsWith(prefix + 'uf')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} The ***[UPLOAD_FAILED]*** error could happen for a number of reasons:\n\`- you aborted the request\`\n\`- your internet connection is weak\`\n\`- you are using an incorrect config\`\n\nIf you are experiencing issues with uploading please ensure that you are using the correct config and that you have followed the setup process correctly. If you are still experiencing issues please provide a ***FULL SCREENSHOT OR VIDEO*** of your issue or error message, this will help us to better understand and assist you.` :
                `The ***[UPLOAD_FAILED]*** error could happen for a number of reasons:\n\`- you canceled the upload request\`\n\`- your internet connection is weak\`\n\`- you are using an incorrect config\`\n\nIf you are experiencing issues with uploading please ensure that you are using the correct config and that you have followed the setup process correctly. If you are still experiencing issues please provide a ***FULL SCREENSHOT OR VIDEO*** of your issue or error message, this will help us to better understand and assist you.`,
        });

        if (message.content.startsWith(prefix + 'insecuressl') || message.content.startsWith(prefix + 'issl')) return message.channel.send({
            content: message.type === MessageType.Reply ?
                `${message.mentions.repliedUser} If you are receiving the \`Could not create SSL/TLS secure channel.\` error in ShareX do not panic, the fix is pretty simple:\n\n## 👉 How to fix\n- 1️⃣ Head over to [dotnet.microsoft.com/en-us/download](https://dotnet.microsoft.com/en-us/download)\n- 2️⃣ Download the latest version for windows.\n- 3️⃣ Once the download is complete open/run the new file and follow the install process.\n- 4️⃣ Once the latest version of the \`.NET\` framework is installed you can try your upload again\n\n## 📷 Helpful Images\n- [Insecure SSL Error](<https://cordximg.host/users/510065483693817867/hNhKeXdm.webp>)\n- [Latest Version](<https://cordximg.host/users/510065483693817867/xcAmtoUS.png>)\n- [Install File](<https://cordximg.host/users/510065483693817867/jClN9Val.png>)` :
                `If you are receiving the \`Could not create SSL/TLS secure channel.\` error in ShareX do not panic, the fix is pretty simple:\n\n## 👉 How to fix\n- 1️⃣ Head over to [dotnet.microsoft.com/en-us/download](<https://dotnet.microsoft.com/en-us/download>)\n- 2️⃣ Download the latest version for windows.\n- 3️⃣ Once the download is complete open/run the new file and follow the install process.\n- 4️⃣ Once the latest version of the \`.NET\` framework is installed you can try your upload again\n\n## 📷 Helpful Images\n- [Insecure SSL Error](<https://cordximg.host/users/510065483693817867/hNhKeXdm.webp>)\n- [Latest Version](<https://cordximg.host/users/510065483693817867/xcAmtoUS.png>)\n- [Install File](<https://cordximg.host/users/510065483693817867/jClN9Val.png>)`,
        });

        if (message.content.startsWith(prefix + 'commands') || message.content.startsWith(prefix + 'cmds')) {

            if (message.channel.id !== '871274622933418045') return message.reply(`You should probably use this command in the <#871274622933418045> channel.`);

            return message.channel.send({
                embeds: [
                    new client.EmbedBuilder({
                        title: 'CordX: Support Commands',
                        description: 'Here are my available support commands.',
                        color: client.config.EmbedColors.base,
                        fields: [
                            {
                                name: 'Commands',
                                value: `\`!support\` \`!docs\` \`!ex\` \`!terms\` \`!sharex\` \`!config\` \`!linux\` \`!moreinfo\` \`!fullscreen\` \`!screenshot\` \`!cordx\` \`!invaliddns\` \`!setup\` \`!verify\` \`!directmessage\` \`!commands\``,
                                inline: false
                            },
                            {
                                name: 'Aliases',
                                value: `\`!sp\` \`!doc\` \`!exp\` \`!tos\` \`!sx\` \`!cfg\` \`!lin\` \`!mi\` \`!full\` \`!ss\` \`!cx\` \`!idns\` \`!su\` \`!v\` \`!dm\` \`!cmds\``,
                                inline: false
                            },
                            {
                                name: 'Summary',
                                value: 'Wow, that\'s a total of 17 commands and 17 aliases. You can use these commands to get help with CordX and ShareX.',
                            }
                        ]
                    })
                ]
            })
        }
    }
}
