import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PromptEditorProps, DEFAULT_PROMPTS, UserPrompt } from '@/types/analysis';
import { Save, Plus, Loader2, BookOpen, Settings, Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PromptEditor({ 
  value, 
  onChange, 
  onSave, 
  onLoad, 
  savedPrompts, 
  isLoading,
  activePromptId
}: PromptEditorProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    isPublic: false,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSavePrompt = async () => {
    if (!saveFormData.name.trim()) return;

    try {
      await onSave({
        name: saveFormData.name.trim(),
        content: value,
        description: saveFormData.description.trim(),
        isDefault: saveFormData.isDefault,
        isPublic: saveFormData.isPublic,
        tags: saveFormData.tags
      });

      // Reset form
      setSaveFormData({
        name: '',
        description: '',
        isDefault: false,
        isPublic: false,
        tags: []
      });
      setShowSaveForm(false);
      setEditingPromptId(null);
      setErrorMessage(null);
      setSuccessMessage('Prompt salvat cu succes.');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setSuccessMessage(null);
      setErrorMessage('Eroare la salvarea prompt-ului. Încearcă din nou.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleEditPrompt = (prompt: UserPrompt) => {
    console.log('Editing prompt:', prompt);
    console.log('Prompt content:', prompt.content);
    console.log('Current value before onChange:', value);
    
    // Load the prompt content into the editor
    onChange(prompt.content);
    
    console.log('Called onChange with:', prompt.content);
    
    setEditingPromptId(prompt.id);
    // Also set this as the active prompt for visual feedback
    onLoad(prompt.id);
    
    setSaveFormData({
      name: prompt.name,
      description: prompt.description || '',
      isDefault: prompt.isDefault,
      isPublic: prompt.isPublic,
      tags: prompt.tags || []
    });
    setShowSaveForm(true);
  };

  const handleUpdatePrompt = async () => {
    if (!editingPromptId || !saveFormData.name.trim()) return;

    try {
      await onSave({
        name: saveFormData.name.trim(),
        content: value,
        description: saveFormData.description.trim(),
        isDefault: saveFormData.isDefault,
        isPublic: saveFormData.isPublic,
        tags: saveFormData.tags
      });

      // Reset form
      setSaveFormData({
        name: '',
        description: '',
        isDefault: false,
        isPublic: false,
        tags: []
      });
      setShowSaveForm(false);
      setEditingPromptId(null);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !saveFormData.tags.includes(newTag.trim())) {
      setSaveFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSaveFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUseTemplate = (template: typeof DEFAULT_PROMPTS[0]) => {
    onChange(template.content);
  };

  return (
    <div className="space-y-4">
      {(successMessage || errorMessage) && (
        <Alert variant={errorMessage ? 'destructive' : 'default'}>
          <AlertDescription>
            {errorMessage || successMessage}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prompt de Analiză</h3>
          <p className="text-sm text-muted-foreground">
            Personalizează criteriile pentru analiza AI
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowSaveForm(true);
              setEditingPromptId(null);
              // Pre-fill form with current prompt data
              setSaveFormData({
                name: '',
                description: '',
                isDefault: false,
                isPublic: false,
                tags: []
              });
            }}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvează Prompt Nou
          </Button>
        </div>
      </div>

      {/* Prompt Templates */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Template-uri Predefinite:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEFAULT_PROMPTS.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleUseTemplate(template)}
              disabled={isLoading}
              className="h-auto p-3 text-left justify-start"
            >
              <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-xs">{template.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt-editor">Prompt personalizat:</Label>
          {activePromptId && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-primary">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                Prompt salvat activ
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(DEFAULT_PROMPTS[0].content);
                  onLoad(''); // Clear active prompt
                }}
                className="h-6 px-2 text-xs"
              >
                Resetează
              </Button>
            </div>
          )}
        </div>
        <Textarea
          id="prompt-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Descrie ce vrei să analizeze AI-ul în screenshot-ul tău de trading..."
          className={`min-h-[120px] resize-none transition-all ${
            activePromptId ? 'ring-2 ring-primary/20 bg-primary/5' : ''
          }`}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{value.length} caractere</span>
          {activePromptId && (
            <span className="text-primary">
              Editezi prompt-ul salvat
            </span>
          )}
        </div>
      </div>

      {/* Save Form */}
      {showSaveForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingPromptId ? 'Editează Prompt Template' : 'Salvează Prompt Template'}
            </CardTitle>
            <CardDescription>
              {editingPromptId 
                ? 'Modifică acest prompt salvat' 
                : 'Salvează acest prompt pentru a-l reutiliza în viitor'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Content Editor - Show for new prompts only, not when editing */}
            {!editingPromptId && (
              <div className="space-y-2">
                <Label htmlFor="prompt-content-save">Conținutul Prompt-ului</Label>
                <Textarea
                  id="prompt-content-save"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Introdu conținutul prompt-ului pe care vrei să-l salvezi..."
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground">
                  {value.length} caractere
                </div>
              </div>
            )}
            
            {/* Prompt Content Editor - Only show when editing */}
            {editingPromptId && (
              <div className="space-y-2">
                <Label htmlFor="prompt-content-edit">Conținutul Prompt-ului</Label>
                <Textarea
                  id="prompt-content-edit"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Editează conținutul prompt-ului..."
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground">
                  {value.length} caractere
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-name">Nume Template</Label>
                <Input
                  id="prompt-name"
                  value={saveFormData.name}
                  onChange={(e) => setSaveFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Analiză Tehnică Completă"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt-description">Descriere</Label>
                <Input
                  id="prompt-description"
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descriere scurtă a template-ului"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tag-uri</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adaugă tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button variant="outline" size="sm" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {saveFormData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {saveFormData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-secondary rounded-md flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-default"
                    checked={saveFormData.isDefault}
                    onCheckedChange={(checked) => setSaveFormData(prev => ({ ...prev, isDefault: checked }))}
                  />
                  <Label htmlFor="is-default">Template implicit</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-public"
                    checked={saveFormData.isPublic}
                    onCheckedChange={(checked) => setSaveFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="is-public">Public</Label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveForm(false);
                    setEditingPromptId(null);
                    setSaveFormData({
                      name: '',
                      description: '',
                      isDefault: false,
                      isPublic: false,
                      tags: []
                    });
                  }}
                >
                  Anulează
                </Button>
                <Button
                  onClick={editingPromptId ? handleUpdatePrompt : handleSavePrompt}
                  disabled={!saveFormData.name.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingPromptId ? 'Actualizează' : 'Salvează'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Prompts */}
      {savedPrompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Prompt-uri Salvate:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedPrompts.map((prompt) => {
              const isActive = activePromptId === prompt.id;
              return (
                <div key={prompt.id} className="relative">
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onLoad(prompt.id)}
                    disabled={isLoading}
                    className={`h-auto p-3 text-left justify-start w-full transition-all ${
                      isActive 
                        ? 'ring-2 ring-primary/20 shadow-md' 
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-xs">{prompt.name}</div>
                        {isActive && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Activ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {prompt.description || 'Fără descriere'}
                      </div>
                      {prompt.tags && prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prompt.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`px-1.5 py-0.5 text-xs rounded text-xs ${
                                isActive 
                                  ? 'bg-primary/20 text-primary' 
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          {prompt.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{prompt.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {isActive && (
                        <div className="mt-2 text-xs text-primary font-medium">
                          ✓ Prompt activ pentru analiză
                        </div>
                      )}
                    </div>
                  </Button>
                  
                  {/* Edit button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPrompt(prompt)}
                    disabled={isLoading}
                    className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-accent"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">💡 Sfaturi pentru prompt-uri eficiente:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Fii specific despre ce vrei să analizeze AI-ul</li>
          <li>• Menționează indicatorii tehnici de interes</li>
          <li>• Specifică timeframe-ul și tipul de analiză</li>
          <li>• Cere recomandări concrete de trading</li>
          <li>• Include cerințe pentru managementul riscului</li>
        </ul>
      </div>
    </div>
  );
}
