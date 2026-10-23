import { ref, shallowRef } from 'vue'

// Runs one of the loaders from lib/sheets.js and exposes its state to a page.
export function useSheet(loader) {
  const data = shallowRef(null)
  const error = ref(null)
  const loading = ref(true)

  loader()
    .then((result) => {
      data.value = result
    })
    .catch((e) => {
      console.error(e)
      error.value = e
    })
    .finally(() => {
      loading.value = false
    })

  return { data, error, loading }
}
