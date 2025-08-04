'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function CreateLeadButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>Ny Lead</span>
      </Button>
      
      {/* TODO: Implementera modal för att skapa ny lead */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Skapa Ny Lead</h2>
            <p className="text-gray-600 mb-4">
              Formulär för att skapa ny lead kommer här...
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Avbryt
              </Button>
              <Button>Spara</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
