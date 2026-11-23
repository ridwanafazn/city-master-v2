import { nextTick, ref, watch } from 'vue'

/**
 * Small wrapper around the native <dialog> element.
 *
 * Native modal dialogs already provide focus trapping, Escape handling and
 * focus restoration, which is why UI-v2 prefers them over custom overlays.
 */
export function useNativeDialog(isOpen: () => boolean, requestClose: () => void) {
  const dialogRef = ref<HTMLDialogElement | null>(null)

  watch(
    isOpen,
    async (open) => {
      await nextTick()
      const dialog = dialogRef.value
      if (!dialog) return
      if (open && !dialog.open) {
        dialog.showModal()
      } else if (!open && dialog.open) {
        dialog.close()
      }
    },
    { immediate: true, flush: 'post' },
  )

  function handleCancel(event: Event) {
    event.preventDefault()
    requestClose()
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === dialogRef.value) requestClose()
  }

  return { dialogRef, handleCancel, handleBackdropClick }
}
