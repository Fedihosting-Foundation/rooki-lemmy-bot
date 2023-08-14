const config:{
    instance: string,
    reasons: {
        value: string,
        label?: string,
        type?: "Post" | "Comment" | "Report",
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
        {
            value: "Duplicate",
            type: "Post",
        },
        {
            value: "Wrong Community",
            type: "Post",
        },
        {
            value: "Report was unjustified",
            type: "Report",
        },
        {
            value: "Report was a mistake",
            type: "Report",
        }
    ]
}

export default config;