const config:{
    instance: string,
    reasons: {
        value: string,
        label?: string,
    }[],
} = {
    instance: "https://lemmy.world/",
    reasons: [
        {
            value: "Harassment/Insulting other Users",
        },
        {
            value: "Bigotry",
        },
        {
            value: "NSFW Content",
        },
        {
            value: "Illegal Content",
        },
        {
            value: "Trolling",
        },
        {
            value: "Spam",
        },
        {
            value: "Self-Promotion",
        },
        {
            value: "Other",
        },
    ]
}

export default config;