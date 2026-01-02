const updateUsername = async (userId, username) => {
    const res = await fetch(`https://www.kogama.com/user/${userId}/username/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        credentials: 'include',
        body: JSON.stringify({ username })
    })
    if (!res.ok) throw new Error(res.status)
    return res
}

updateUsername('yourid', 'NewUsername')
