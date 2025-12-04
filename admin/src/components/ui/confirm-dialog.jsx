import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { Button } from './button'

let confirmResolver = null

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('Confirm')

  const confirm = useCallback((msg, titleText = 'Confirm') => {
    return new Promise((resolve) => {
      setMessage(msg)
      setTitle(titleText)
      setIsOpen(true)
      confirmResolver = resolve
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    if (confirmResolver) {
      confirmResolver(true)
      confirmResolver = null
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (confirmResolver) {
      confirmResolver(false)
      confirmResolver = null
    }
  }

  const ConfirmDialog = () => (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirm, ConfirmDialog }
}

