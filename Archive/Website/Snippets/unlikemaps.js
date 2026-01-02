const unlikeAll = async (uid, page = 1, count = 77) => {
  const res = await fetch(`https://www.kogama.com/game/category/likes/?page=${page}&count=${count}`)
  if (!res.ok) throw new Error(res.status)

  const { data } = await res.json()
  let done = 0

  for (const { id } of data) {
      const r = await fetch(`https://www.kogama.com/game/${id}/like/${uid}/`, { method: 'DELETE' })
      if (r.ok) console.log(`${++done} / ${data.length} unliked`)
      else console.log(`Failed to unlike ${id}`)
  }
}

unlikeAll('yourUID').catch(console.error)
