import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { apiService } from '../../services/api';
import type { PortfolioItem, CreatePortfolioData, UpdatePortfolioData } from '../../types';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio?: PortfolioItem | null;
  onSave: (portfolio: PortfolioItem) => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onSave
}) => {
  const [formData, setFormData] = useState<CreatePortfolioData>({
    title: portfolio?.title || '',
    description: portfolio?.description || '',
    image_url: portfolio?.image_url || '',
    link_url: portfolio?.link_url || '',
    category: portfolio?.category || '',
    technologies: portfolio?.technologies || [],
  });
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (portfolio) {
        // Update existing portfolio
        response = await apiService.updatePortfolio(portfolio.id, formData as UpdatePortfolioData);
      } else {
        // Create new portfolio
        response = await apiService.createPortfolio(formData);
      }

      onSave(response.portfolio);
      handleClose();
    } catch (error: unknown) {
      console.error('Error saving portfolio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save portfolio';
      setErrors({ submit: (error as { response?: { data?: { error?: string } } })?.response?.data?.error || errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: portfolio?.title || '',
      description: portfolio?.description || '',
      image_url: portfolio?.image_url || '',
      link_url: portfolio?.link_url || '',
      category: portfolio?.category || '',
      technologies: portfolio?.technologies || [],
    });
    setTechInput('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{portfolio ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="Project title"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
              Description *
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Describe your project..."
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="link_url" className="block text-sm font-medium text-secondary-700 mb-1">
                Project Link
              </label>
              <Input
                id="link_url"
                name="link_url"
                type="url"
                value={formData.link_url}
                onChange={handleChange}
                error={errors.link_url}
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-secondary-700 mb-1">
                Image URL
              </label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                error={errors.image_url}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
              Category
            </label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              placeholder="e.g., Web Development, Mobile App, Design"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Technologies Used
            </label>
            <div className="flex">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add a technology (e.g., React, Node.js)"
                className="rounded-r-none"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddTechnology}
                className="rounded-l-none border-l-0"
              >
                Add
              </Button>
            </div>
            
            {formData.technologies && formData.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(tech)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {errors.submit && (
            <div className="text-danger-600 text-sm">{errors.submit}</div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
            >
              {portfolio ? 'Update' : 'Add'} Portfolio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioModal;