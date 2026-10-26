// Non-overlapping placement of map markers.
//
// Each item is a box (in screen pixels) centred on its anchor, i.e. where the site
// really is. Overlapping boxes push each other apart along the axis where the
// overlap is smallest (for wide, flat bars this is usually vertical), while a gentle
// spring pulls every box back towards its anchor so it stays as close as possible.
// The last passes have no spring, so the result has no overlap.
//
// items:   [{ x, y, width, height }]  x, y = centre of the box at its anchor
// returns: [{ dx, dy }]               how far each box must move from its anchor

const EPSILON = 0.01

export function repel(items, { gap = 3, iterations = 120, pull = 0.08, maxCleanupPasses = 3000 } = {}) {
  const positions = items.map((item) => ({ x: item.x, y: item.y }))
  const count = items.length

  const separate = () => {
    let overlaps = 0
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = positions[i]
        const b = positions[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const overlapX = (items[i].width + items[j].width) / 2 + gap - Math.abs(dx)
        const overlapY = (items[i].height + items[j].height) / 2 + gap - Math.abs(dy)
        if (overlapX <= 0 || overlapY <= 0) continue
        overlaps++
        if (overlapY <= overlapX) {
          // same place: alternate up and down so stacked sites fan out evenly
          const direction = dy !== 0 ? Math.sign(dy) : (j % 2 === 0 ? 1 : -1)
          const shift = overlapY / 2 + EPSILON
          a.y -= direction * shift
          b.y += direction * shift
        } else {
          const direction = dx !== 0 ? Math.sign(dx) : 1
          const shift = overlapX / 2 + EPSILON
          a.x -= direction * shift
          b.x += direction * shift
        }
      }
    }
    return overlaps
  }

  for (let step = 0; step < iterations; step++) {
    separate()
    positions.forEach((position, i) => {
      position.x += (items[i].x - position.x) * pull
      position.y += (items[i].y - position.y) * pull
    })
  }
  for (let pass = 0; pass < maxCleanupPasses; pass++) {
    if (separate() === 0) break
  }

  return positions.map((position, i) => ({ dx: position.x - items[i].x, dy: position.y - items[i].y }))
}
