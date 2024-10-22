"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Bold, Italic, List, Undo, Redo, Copy, Check, Plus, Edit, Trash, Save, Settings, X, Linkedin, FileText } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Ollama } from "@langchain/community/llms/ollama"
import { PromptTemplate } from "@langchain/core/prompts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Slider } from "@/components/ui/slider"
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    const timezone = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]
    return `${hours}:${minutes}:${seconds} (${timezone})`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="text-center">
      <div className="font-mono text-lg">
        {formatTime(time)}
      </div>
      <div className="font-mono text-sm text-gray-500">
        {formatDate(time)}
      </div>
    </div>
  )
}

const DEFAULT_PROMPT = `You are a helpful assistant. Generate a meeting minute summary but capture most of the content and expand on topics as needed. Do not use markdown or ** in the output. If there are abbreviations like AS, PS, HW, etc., leave them as is without changes.`

const DEFAULT_TEMPLATE = `Meeting Minutes Summary [ENTER TITLE]

Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Attendees:

[Name 1]
[Name 2]
[Name 3]

Agenda:
[Agenda Item 1]
[Agenda Item 2]
[Agenda Item 3]

Discussion Points:

[Key Point 1]
[Key Point 2]
[Key Point 3]

Action Items:

[Action Item 1] - [Responsible Person] - [Due Date]
[Action Item 2] - [Responsible Person] - [Due Date]

Next Meeting: // None if no next meeting on note
[Date and Time]

Summary of Meeting:
`

function Header({ 
  onTemplatesChange, 
  onSavedNotesChange, 
  onAIServicesChange,
  onInstructionsChange,
  onSettingsChange,
  isTemplatesChecked,
  isSavedNotesChecked,
  isAIServicesChecked,
  isSettingsChecked,
  isInstructionsOpen,
  isSettingsOpen,
}: { 
  onTemplatesChange: (checked: boolean) => void,
  onSavedNotesChange: (checked: boolean) => void,
  onAIServicesChange: (checked: boolean) => void,
  onInstructionsChange: (open: boolean) => void,
  onSettingsChange: (checked: boolean) => void,
  isTemplatesChecked: boolean,
  isSavedNotesChecked: boolean,
  isAIServicesChecked: boolean,
  isSettingsChecked: boolean,
  isInstructionsOpen: boolean,
  isSettingsOpen: boolean,
}) {
  return (
    <header className="border-b border-gray-200 py-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between">
          <nav className="space-x-4">
            <button 
              onClick={() => onInstructionsChange(!isInstructionsOpen)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              INSTRUCTIONS
            </button>
            <a 
              href="https://www.linkedin.com/in/luisvillalobosmolina" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center space-x-1"
            >
              <span>Composer {'->'} </span>
              <Linkedin className="h-4 w-4" />
            </a>
          </nav>
          <Clock />
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <Checkbox id="saved-notes" checked={isSavedNotesChecked} onCheckedChange={onSavedNotesChange} />
              <span className="text-sm font-medium text-gray-700">SAVED NOTES</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox id="ai-services" checked={isAIServicesChecked} onCheckedChange={onAIServicesChange} />
              <span className="text-sm font-medium text-gray-700">AI SERVICES</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox id="templates" checked={isTemplatesChecked} onCheckedChange={onTemplatesChange} />
              <span className="text-sm font-medium text-gray-700">TEMPLATES</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox id="settings" checked={isSettingsChecked} onCheckedChange={onSettingsChange} />
              <span className="text-sm font-medium text-gray-700">SETTINGS</span>
            </label>
          </div>
        </div>
      </div>
    </header>
  )
}

function InstructionsPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-[500px] max-w-[90vw] max-h-[500px] overflow-y-auto font-mono">
        <CardHeader>
          <CardTitle className="text-base">Setup Instructions</CardTitle>
          <CardDescription className="text-xs">Follow these steps to set up Ollama and OpenAI</CardDescription>
        </CardHeader>
        <CardContent className="font-mono text-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-sm">1. Install Ollama (Locally)</h3>
              <ol className="list-decimal list-inside space-y-2 text-xs">
                <li><strong>Download:</strong> Go to ollama.com/download and download the installer for your operating system.</li>
                <li><strong>Install:</strong> Run the installer and follow the prompts to complete the installation.</li>
                <li><strong>Launch:</strong> Open Ollama from your Applications folder or via the command line using ollama.</li>
                <li><strong>Download a Model:</strong> Open a Terminal (on macOS) or Command Prompt (on Windows), and run the following command to download a model:
                  <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">ollama pull [model name]</pre>
                  Replace [model name] with the specific model you want to download, such as llama3.2
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm">2. Get OpenAI API Keys</h3>
              <ol className="list-decimal list-inside space-y-2 text-xs">
                <li><strong>Sign Up / Log In:</strong> Go to platform.openai.com and sign in to your account (or create one if you don't have it).</li>
                <li><strong>Access API Keys:</strong> In the dashboard, go to API Keys under the User menu.</li>
                <li><strong>Create a New Key:</strong> Click on + New Key, name it, and copy the key displayed. Store it securely.</li>
              </ol>
            </div>
          </div>
        </CardContent>
        <div className="p-4 flex justify-end">
          <Button onClick={onClose} variant="outline" className="font-mono text-xs">Close</Button>
        </div>
      </Card>
    </div>
  );
}

interface SavedNote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface AIService {
  id: number;
  name: string;
  apiKey: string;
}

// New AutoResizeTextarea component
const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ onChange, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [props.value])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event)
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <Textarea
      {...props}
      ref={(node) => {
        textareaRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      onChange={handleChange}
      style={{
        minHeight: '200px',
        maxHeight: '500px',
        overflow: 'auto',
        resize: 'none',
        transition: 'height 0.2s ease-in-out',
      }}
    />
  )
})

AutoResizeTextarea.displayName = 'AutoResizeTextarea'

export function NoteTakingAppComponent() {
  const [note, setNote] = useState("")
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [templates, setTemplates] = useState<{ id: number; name: string; content: string }[]>([
    { id: 0, name: "Default", content: DEFAULT_TEMPLATE }
  ])
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" })
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null)
  const [isSavedNotesOpen, setIsSavedNotesOpen] = useState(false)
  const [isAIServicesOpen, setIsAIServicesOpen] = useState(false)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const [isTemplatesChecked, setIsTemplatesChecked] = useState(false)
  const [isSavedNotesChecked, setIsSavedNotesChecked] = useState(false)
  const [isAIServicesChecked, setIsAIServicesChecked] = useState(false)
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  const [editingNote, setEditingNote] = useState<SavedNote | null>(null)
  const [aiServices, setAIServices] = useState<AIService[]>([
    { id: 1, name: "Ollama", apiKey: "" }
  ])
  const [defaultAIService, setDefaultAIService] = useState<AIService>(aiServices[0])
  const [newAIService, setNewAIService] = useState({ name: "", apiKey: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSettingsChecked, setIsSettingsChecked] = useState(false)
  const [llmPrompt, setLlmPrompt] = useState(DEFAULT_PROMPT)
  const [llmTemperature, setLlmTemperature] = useState(0.7)
  const [selectedTemplateId, setSelectedTemplateId] = useState("0")
  const [selectedTemplateContent, setSelectedTemplateContent] = useState(DEFAULT_TEMPLATE)
  const [noteTitle, setNoteTitle] = useState("")
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isConfirmCloseDialogOpen, setIsConfirmCloseDialogOpen] = useState(false)

  const generateSummary = () => {
    setIsGenerating(true)
    setIsModalOpen(true)
    setSummary("")

    // Simulating AI text generation with a streaming effect
    const fullSummary = "This is a simulated AI-generated summary of your notes. It highlights key points and provides a concise overview of the main ideas discussed in the meeting. The summary aims to capture the essence of the discussion, making it easier to review and share important information from the meeting."
    let currentIndex = 0

    const streamText = () => {
      if (currentIndex < fullSummary.length) {
        setSummary((prev) => prev + fullSummary[currentIndex])
        currentIndex++
        setTimeout(streamText, 50) // Adjust the speed of "typing" here
      } else {
        setIsGenerating(false)
      }
    }

    setTimeout(streamText, 1000) // Delay to simulate processing time
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The summary has been copied to your clipboard.",
    })
  }

  const handleSave = () => {
    const newNote: SavedNote = {
      id: Date.now(),
      title: noteTitle.trim() || `Note ${savedNotes.length + 1}`,
      content: summary,
      createdAt: new Date().toISOString(),
    }
    setSavedNotes([...savedNotes, newNote])
    setIsModalOpen(false)
    setNoteTitle("") // Reset the title input
    setSummary("") // Reset the summary
    toast({
      title: "Summary saved",
      description: "Your summary has been saved successfully.",
    })
  }

  const handleTemplatesChange = (checked: boolean) => {
    if (!checked && (newTemplate.name || newTemplate.content)) {
      const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (confirmClose) {
        setIsTemplatesChecked(false);
        setIsTemplatesOpen(false);
        setNewTemplate({ name: "", content: "" });
      }
    } else {
      setIsTemplatesChecked(checked);
      setIsTemplatesOpen(checked);
    }
  };

  const handleSavedNotesChange = (checked: boolean) => {
    setIsSavedNotesChecked(checked);
    setIsSavedNotesOpen(checked);
  };

  const handleAIServicesChange = (checked: boolean) => {
    setIsAIServicesChecked(checked);
    setIsAIServicesOpen(checked);
  };

  const handleInstructionsChange = (open: boolean) => {
    setIsInstructionsOpen(open);
  };

  const handleNewTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTemplate({ ...newTemplate, [e.target.name]: e.target.value })
  }

  const handleSaveTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      if (editingTemplate !== null) {
        setTemplates(templates.map(t => 
          t.id === editingTemplate ? { ...t, ...newTemplate } : t
        ))
        setEditingTemplate(null)
        toast({
          title: "Template updated",
          description: "Your template has been updated successfully.",
        })
      } else {
        const newId = Math.max(...templates.map(t => t.id)) + 1
        setTemplates([...templates, { id: newId, ...newTemplate }])
        toast({
          title: "Template saved",
          description: "Your new template has been saved successfully.",
        })
      }
      setNewTemplate({ name: "", content: "" })
    }
  }

  const handleEditTemplate = (id: number) => {
    const template = templates.find(t => t.id === id)
    if (template) {
      setNewTemplate({ name: template.name, content: template.content })
      setEditingTemplate(id)
    }
  }

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter(t => t.id !== id))
    toast({
      title: "Template deleted",
      description: "Your template has been deleted successfully.",
    })
  }

  const handleEditNote = (note: SavedNote) => {
    setEditingNote(note)
  }

  const handleSaveEditedNote = async () => {
    if (editingNote) {
      const updatedNotes = savedNotes.map(note =>
        note.id === editingNote.id ? editingNote : note
      )
      setSavedNotes(updatedNotes)
      setHasUnsavedChanges(false)
      setIsEditNoteDialogOpen(false)
      
      // Update the note in the database
      try {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingNote),
        })
        if (!response.ok) {
          throw new Error('Failed to update note')
        }
      } catch (error) {
        console.error('Error updating note:', error)
        toast({
          title: "Error",
          description: "Failed to update note. Please try again.",
          variant: "destructive",
        })
      }

      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      })
    }
  }

  const handleDeleteNote = (id: number) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id))
    toast({
      title: "Note deleted",
      description: "Your note has been deleted successfully.",
    })
  }

  const handleNewAIServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAIService({ ...newAIService, [e.target.name]: e.target.value })
  }

  const handleSaveAIService = () => {
    if (newAIService.name && newAIService.apiKey) {
      const  newService = { id: Date.now(), ...newAIService }
      setAIServices([...aiServices, newService])
      setNewAIService({ name: "", apiKey: "" })
      toast({
        title: "AI Service added",
        
        description: "Your new AI service has been added successfully.",
      })
    }
  }

  const handleSetDefaultAIService = (id: number) => {
    const service = aiServices.find(s => s.id === id)
    if (service) {
      setDefaultAIService(service)
      toast({
        title: "Default AI Service updated",
        description: `${service.name} is now set as the default AI service.`,
      })
    }
  }

  const handleDeleteAIService = (id: number) => {
    setAIServices(aiServices.filter(s => s.id !== id))
    if (defaultAIService.id === id) {
      setDefaultAIService(aiServices[0])
    }
    toast({
      title: "AI Service deleted",
      description: "The AI service has been deleted successfully.",
    })
  }

  const handleSettingsChange = (checked: boolean) => {
    setIsSettingsChecked(checked);
    setIsSettingsOpen(checked);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLlmPrompt(e.target.value)
  }

  const handleTemperatureChange = (value: number[]) => {
    setLlmTemperature(value[0])
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your LLM settings have been updated.",
    })
    setIsSettingsOpen(false)
  }

  const handleSummarize = async () => {
    console.log("Summarize button clicked. Note content:", note); // Debug log

    if (!note) {
      toast({
        title: "Error",
        description: "Please enter some content to summarize.",
        variant: "destructive",
      })
      return
    }

    setIsStreaming(true)
    setIsModalOpen(true)
    setSummary("")
    setNoteTitle("") // Reset the title when generating a new summary

    try {
      const model = new Ollama({
        baseUrl: "http://localhost:11434",
        model: "llama3.2",
        temperature: llmTemperature,
        // @ts-ignore
        streaming: true,
      })

      const combinedPrompt = `${llmPrompt}\n\nUse the following template for the summary:\n\n${selectedTemplateContent}\n\nInput text:\n${note}`
      console.log("Combined prompt:", combinedPrompt); // Debug log

      const prompt = PromptTemplate.fromTemplate(combinedPrompt)

      const chain = prompt.pipe(model)

      console.log("Sending request to LLM..."); // Debug log
      const stream = await chain.stream({
        text: note, // Ensure we're passing the note content here
      })

      console.log("Received stream from LLM"); // Debug log
      for await (const chunk of stream) {
        setSummary((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("Error summarizing content:", error)
      toast({
        title: "Error",
        description: "An error occurred while summarizing the content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleCloseModal = () => {
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmClose = () => {
    setIsConfirmDialogOpen(false)
    setIsModalOpen(false)
    setSummary("")
  }

  const handleCancelClose = () => {
    setIsConfirmDialogOpen(false)
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value)
    const template = templates.find(t => t.id.toString() === value)
    if (template) {
      setSelectedTemplateContent(template.content)
    }
  }

  const handleNoteClick = (noteId: number) => {
    const clickedNote = savedNotes.find((note) => note.id === noteId)
    if (clickedNote) {
      setEditingNote({ ...clickedNote })
      setNoteTitle(clickedNote.title)
      setIsEditNoteDialogOpen(true)
      setHasUnsavedChanges(false)
    }
  }

  const handleClearClick = () => {
    setIsClearDialogOpen(true)
  }

  const handleClearConfirm = () => {
    setNote("")
    setIsClearDialogOpen(false)
    toast({
      title: "Input cleared",
      description: "Your input has been cleared successfully.",
    })
  }

  const handleClearCancel = () => {
    setIsClearDialogOpen(false)
  }

  const handleCloseEditNoteDialog = () => {
    if (hasUnsavedChanges) {
      setIsConfirmCloseDialogOpen(true)
    } else {
      setIsEditNoteDialogOpen(false)
      setEditingNote(null)
    }
  }

  const handleEditNoteChange = (field: 'title' | 'content', value: string) => {
    if (editingNote) {
      setEditingNote(prevNote => ({
        ...prevNote,
        [field]: value
      }))
      setHasUnsavedChanges(true)
    }
  }

  const handleCopyContent = () => {
    if (editingNote) {
      const contentToCopy = `${editingNote.title}\n\n${editingNote.content}`;
      navigator.clipboard.writeText(contentToCopy).then(() => {
        toast({
          title: "Content copied!",
          description: "The note content has been copied to your clipboard.",
        });
      }).catch(err => {
        console.error("Failed to copy: ", err);
      });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onTemplatesChange={handleTemplatesChange}
        onSavedNotesChange={handleSavedNotesChange}
        onAIServicesChange={handleAIServicesChange}
        onInstructionsChange={handleInstructionsChange}
        onSettingsChange={handleSettingsChange}
        isTemplatesChecked={isTemplatesChecked}
        isSavedNotesChecked={isSavedNotesChecked}
        isAIServicesChecked={isAIServicesChecked}
        isSettingsChecked={isSettingsChecked}
        isInstructionsOpen={isInstructionsOpen}
        isSettingsOpen={isSettingsOpen}
      />
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900">
          <span className="bg-yellow-200 px-1">PRIVATE</span>. MEETING NOTES
        </h1>
        <div className="space-y-6">
          <AutoResizeTextarea
            placeholder="Type your note here..."
            className="w-full rounded-none border-x-0 border-t-0 border-b border-gray-300 p-2 focus:border-gray-400 focus:outline-none focus:ring-0"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <Button onClick={handleClearClick} variant="outline" size="sm">
              Clear
            </Button>
            <div className="flex items-center space-x-2">
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSummarize} variant="outline" size="sm" disabled={isStreaming}>
                {isStreaming ? "Summarizing..." : "Summarize"}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            *Not private when using external services, as meeting notes are transmitted to these services for summarization.
          </p>
        </div>

        {/* Swiper Carousel */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Saved Notes</h2>
          <Swiper
            slidesPerView="auto"
            spaceBetween={20}
            freeMode={true}
            navigation={true}
            modules={[FreeMode, Navigation]}
            className="mySwiper"
          >
            {savedNotes.map((note) => (
              <SwiperSlide key={note.id} className="!w-64">
                <div 
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer h-40 overflow-hidden"
                  onClick={() => handleNoteClick(note.id)}
                >
                  <h3 className="font-bold mb-2 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-4">{note.content}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>AI-Generated Summary</DialogTitle>
            <DialogDescription>
              {isStreaming ? "Generating summary..." : "Here's a concise summary of your meeting notes. You can edit it below."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="note-title" className="text-sm font-medium">
                Title (optional)
              </label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter a title for your note"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                disabled={isStreaming}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <Textarea
              value={summary}
              onChange={handleSummaryChange}
              className="min-h-[200px] w-full resize-none rounded-md border border-gray-300 p-2 focus:border-gray-400 focus:outline-none focus:ring-0"
              readOnly={isStreaming}
            />
          </div>
          {isStreaming && (
            <div className="mt-2 flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-gray-500"></div>
            </div>
          )}
          <div className="mt-4 flex space-x-2">
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>No, keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Yes, cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog 
        open={isTemplatesOpen} 
        onOpenChange={(open) => {
          if (!open) {
            if (newTemplate.name || newTemplate.content) {
              const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
              if (confirmClose) {
                setIsTemplatesOpen(false);
                setIsTemplatesChecked(false);
                setNewTemplate({ name: "", content: ""});
              }
            } else {
              setIsTemplatesOpen(false);
              setIsTemplatesChecked(false);
            }
          } else {
            setIsTemplatesOpen(true);
            setIsTemplatesChecked(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Meeting Note Templates</DialogTitle>
            <DialogDescription>
              Create and manage your meeting note templates here.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{editingTemplate !== null ? "Edit Template" : "New Template"}</h3>
              <Input
                placeholder="Template Name"
                name="name"
                value={newTemplate.name}
                onChange={handleNewTemplateChange}
              />
              <Textarea
                placeholder="Template Content"
                name="content"
                value={newTemplate.content}
                onChange={handleNewTemplateChange}
                className="min-h-[100px]"
              />
              <Button onClick={handleSaveTemplate} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> {editingTemplate !== null ? "Update Template" : "Save New Template"}
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Saved Templates</h3>
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between rounded-md border border-gray-200 p-2">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.content.substring(0, 50)}...</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {template.name !== "Default" && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isSavedNotesOpen} 
        onOpenChange={(open) => {
          setIsSavedNotesOpen(open);
          setIsSavedNotesChecked(open);
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Saved Notes</DialogTitle>
            <DialogDescription>
              View and edit your saved notes here.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {editingNote ? (
              <div className="space-y-4">
                <Input
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                  className="font-medium"
                />
                <Textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  className="min-h-[200px]"
                />
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingNote(null)}>
                    Cancel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveEditedNote}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {savedNotes.map((note) => (
                  <div key={note.id} className="flex items-center justify-between rounded-md border border-gray-200 p-2">
                    <div>
                      <h4 className="font-medium">{note.title}</h4>
                      <p className="text-sm text-gray-500">{note.content.substring(0, 50)}...</p>
                      <p className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isAIServicesOpen} 
        onOpenChange={(open) => {
          setIsAIServicesOpen(open);
          setIsAIServicesChecked(open);
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>AI Services</DialogTitle>
            <DialogDescription>
              Manage your AI service providers here.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Add New AI Service</h3>
              <Input
                placeholder="Service Name"
                name="name"
                value={newAIService.name}
                onChange={handleNewAIServiceChange}
              />
              <Input
                placeholder="API Key"
                name="apiKey"
                type="password"
                value={newAIService.apiKey}
                onChange={handleNewAIServiceChange}
              />
              <Button onClick={handleSaveAIService} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add AI Service
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">AI Services</h3>
              {aiServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-md border border-gray-200 p-2">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">API Key: ••••••••</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant={defaultAIService.id === service.id ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleSetDefaultAIService(service.id)}
                    >
                      {defaultAIService.id === service.id ? "Default" : "Set as Default"}
                    </Button>
                    {service.name !== "Ollama" && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAIService(service.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isSettingsOpen} 
        onOpenChange={handleSettingsChange}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>LLM Settings</DialogTitle>
            <DialogDescription>
              Configure the prompt and temperature for the LLM.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="llm-prompt" className="text-sm font-medium">Prompt Template</label>
              <Textarea
                id="llm-prompt"
                value={llmPrompt}
                onChange={handlePromptChange}
                className="min-h-[100px]"
                placeholder="Enter your prompt template here."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="llm-temperature" className="text-sm font-medium">Temperature: {llmTemperature}</label>
              <Slider
                id="llm-temperature"
                min={0}
                max={1}
                step={0.1}
                value={[llmTemperature]}
                onValueChange={handleTemperatureChange}
              />
              <p className="text-xs text-gray-500">
                Adjust the creativity of the LLM output. Lower values produce more focused and deterministic outputs, while higher values introduce more randomness and creativity.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InstructionsPopup isOpen={isInstructionsOpen} onClose={() => setIsInstructionsOpen(false)} />

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to clear the input?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All content in the input field will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClearCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConfirm}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditNoteDialogOpen} onOpenChange={handleCloseEditNoteDialog}>
        <DialogContent className="sm:max-w-[700px] sm:h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Make changes to your note here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center">
                <Input
                  value={editingNote?.title || ""}
                  onChange={(e) => handleEditNoteChange('title', e.target.value)}
                  placeholder="Note Title"
                  className="text-lg font-bold border border-gray-300 rounded-md flex-grow"
                />
                <Button 
                  onClick={handleCopyContent} 
                  className="flex items-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-white text-black hover:bg-gray-100 hover:text-black h-8 rounded-md px-3 text-xs ml-2" // Added margin-left for spacing
                >
                  <FileText className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
              </div>
              <AutoResizeTextarea
                value={editingNote?.content || ""}
                onChange={(e) => handleEditNoteChange('content', e.target.value)}
                placeholder="Note Content"
                className="min-h-[300px] resize-none border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCloseEditNoteDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedNote} disabled={!hasUnsavedChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Close Dialog */}
      <AlertDialog open={isConfirmCloseDialogOpen} onOpenChange={setIsConfirmCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsConfirmCloseDialogOpen(false)
              setIsEditNoteDialogOpen(false)
              setEditingNote(null) // Disregard changes
            }}>Close without saving</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

