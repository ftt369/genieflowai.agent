import React, { useState } from 'react';
import { ReportService, ReportConfig } from '../../services/reportService';
import { modelServiceFactory } from '../../services/modelService';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

export const ReportAgent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sections, setSections] = useState<string[]>(['Executive Summary', 'Introduction', 'Findings', 'Conclusion']);
  const [newSection, setNewSection] = useState('');
  const [style, setStyle] = useState<'formal' | 'casual' | 'technical'>('formal');
  const [format, setFormat] = useState<'detailed' | 'summary' | 'bullet-points'>('detailed');
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportService = new ReportService(modelServiceFactory.getService('gemini'));

  const handleAddSection = () => {
    if (newSection.trim()) {
      setSections([...sections, newSection.trim()]);
      setNewSection('');
    }
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleGenerateReport = async () => {
    if (!title || !prompt || sections.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const config: ReportConfig = {
        title,
        sections,
        style,
        format
      };

      const generatedReport = await reportService.generateReport(prompt, config);
      setReport(generatedReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportToWord = async () => {
    if (!report) {
      alert('Please generate a report first');
      return;
    }

    try {
      await reportService.exportToWord(report, title);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('Failed to export to Word. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Report Generator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <TextField
            label="Report Title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Report Prompt"
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
            helperText="Describe what you want the report to be about"
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Sections
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {sections.map((section, index) => (
                <Chip
                  key={index}
                  label={section}
                  onDelete={() => handleRemoveSection(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="New Section"
                value={newSection}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSection(e.target.value)}
                size="small"
              />
              <IconButton onClick={handleAddSection} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Style</InputLabel>
              <Select
                value={style}
                label="Style"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStyle(e.target.value as typeof style)}
              >
                <MenuItem value="formal">Formal</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                label="Format"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value as typeof format)}
              >
                <MenuItem value="detailed">Detailed</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="bullet-points">Bullet Points</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              fullWidth
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportToWord}
              disabled={!report}
              startIcon={<DownloadIcon />}
            >
              Export to Word
            </Button>
          </Box>
        </Stack>
      </Paper>

      {report && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Report
          </Typography>
          <Box sx={{ whiteSpace: 'pre-wrap' }}>{report}</Box>
        </Paper>
      )}
    </Box>
  );
}; 