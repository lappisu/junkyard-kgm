const getMembers = async pid => {
    const res = await fetch(`https://www.kogama.com/game/${pid}/member`)
    if (!res.ok) throw new Error(res.status)

    const { data } = await res.json()
    const title = data[0]?.name ?? 'Unknown'

    console.log(
        `Game: ${title}\nMembers:\n` +
        data.map(({ member_username, member_user_id }) =>
            `${member_username} (${member_user_id})`
        ).join('\n')
    )
}

getMembers('ProjectID').catch(console.error)
