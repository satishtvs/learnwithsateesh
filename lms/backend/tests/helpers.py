"""Test helpers: a part completes only after its video is watched (and its quiz, if any, is passed)."""


async def watch(client, base: str, part: str, seconds: int = 600, duration: int = 600):
    return await client.post(f"{base}/parts/{part}/watch", json={"seconds": seconds, "duration": duration})


async def watch_and_complete(client, base: str, part: str):
    """Watch the whole video, then mark complete. Returns the PUT response."""
    await watch(client, base, part)
    return await client.put(f"{base}/parts/{part}/progress", json={"completed": True})
