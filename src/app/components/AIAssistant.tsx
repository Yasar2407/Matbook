'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Slide,
  Avatar,
  Fade,
  useTheme,
  Tooltip,
  Card,
  CardMedia,
  Chip,
  Button,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from 'axios';

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Strive not to be a success, but rather to be of value. - Albert Einstein",
  "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
  "Life is what happens when you're busy making other plans. - John Lennon",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "The way to get started is to quit talking and begin doing. - Walt Disney"
];


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.NEXT_PUBLIC_TOKEN;
const ENTITY = process.env.NEXT_PUBLIC_ENTITY;

const AiAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; loading?: boolean; images?: string[]; files?: { name: string, url: string }[] }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  const refreshQuote = () => {
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(newQuote);
    return newQuote;
  };

  const handleOpen = () => {
    refreshQuote();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setMessages([]);
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!query.trim() && selectedFiles.length === 0) return;
  
    const userMessage = { 
      sender: 'user' as const, 
      text: query,
      files: selectedFiles.length > 0 ? selectedFiles.map(file => ({ 
        name: file.name, 
        url: URL.createObjectURL(file) 
      })) : undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsTyping(true);
    setSelectedFiles([]);
  
    // Show temporary 'Thinking...' message
    const tempResponse = { sender: 'ai' as const, text: 'Thinking...', loading: true };
    setMessages(prev => [...prev, tempResponse]);
  
    const formData = new FormData();
    formData.append('requirements', query);
    
    // Append files to formData
    selectedFiles.forEach(file => {
      formData.append('File', file);
    });
  
    try {
      console.log('Sending request with prompt:', query);
      
      // First POST API call
      const postResponse = await axios.post(
        `${API_URL}/api/user/service/${ENTITY}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${TOKEN}`,
          },
        }
      );
  
      console.log('POST API Response:', postResponse.data?._id);
      
      if (postResponse.status !== 200) {
        throw new Error(`POST API request failed with status ${postResponse.status}`);
      }
  
      const id = postResponse.data?._id;
      console.log("ID:", id);
      
      // Second GET API call using the ID
      const getResponse = await axios.get(
        `${API_URL}/api/user/service/data/${ENTITY}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        }
      );
  
      console.log('GET API Response:', getResponse.data?.data?.Response);
  
      let responseText = '';
      const images: string[] = [];
  
     

// Update the response processing in handleSend function
    if (getResponse.data?.data?.Response) {
      const response = getResponse.data?.data?.Response;
      const referenceUrl = getResponse.data?.data?.Reference;
    
      const processValue = (value: any): { content: string, images: string[] } => {
        if (value === null || value === undefined) return { content: '', images: [] };
    
        if (typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
          return { content: '', images: [value] };
        }
    
        if (typeof value === 'string' && value.startsWith('https')) {
          return {
            content: `<a href="${value}" target="_blank" rel="noopener noreferrer" style="color: ${theme.palette.primary.main}; text-decoration: none;">${value}</a>`,
            images: []
          };
        }
    
        return { content: value.toString(), images: [] };
      };
    
      const formatArray = (arr: any[]): { content: string, images: string[] } => {
        if (arr.length === 0) return { content: '', images: [] };
    
        let images: string[] = [];
        const content = arr.map(item => {
          if (typeof item === 'object') {
            const formatted = formatObject(item);
            images.push(...formatted.images);
            return formatted.content;
          } else {
            const processed = processValue(item);
            images.push(...processed.images);
            return processed.content;
          }
        }).join('');
    
        return { content, images };
      };
    
      const formatObject = (obj: any): { content: string, images: string[] } => {
        let images: string[] = [];
    
        const content = Object.entries(obj)
          .map(([key, value]) => {
            if (value === null || value === undefined) return '';
    
            let processed;
            if (Array.isArray(value)) {
              const formatted = formatArray(value);
              images.push(...formatted.images);
              processed = formatted.content;
            } else if (typeof value === 'object') {
              const formatted = formatObject(value);
              images.push(...formatted.images);
              processed = formatted.content;
            } else {
              processed = processValue(value);
              images.push(...processed.images);
              processed = processed.content;
            }
    
            if (typeof value === 'string' && value.startsWith('[{') && value.endsWith('}]')) {
              try {
                const parsedArray = JSON.parse(value);
                if (Array.isArray(parsedArray)) {
                  const formatted = formatArray(parsedArray);
                  images.push(...formatted.images);
                  return `<div style="margin-bottom: 4px;"><strong>${key}:</strong><br/>${formatted.content}</div>`;
                }
              } catch (e) {
                console.log('Failed to parse JSON string:', e);
              }
            }
    
            return processed ? `<div style="margin-bottom: 4px;"><strong>${key}:</strong> ${processed}</div>` : '';
          })
          .filter(Boolean)
          .join('');
    
        return { content, images };
      };
    
      if (Array.isArray(response)) {
        // Process all responses first
        const processedResponses = response.map((item: any) => {
            if (typeof item === 'object') {
                return formatObject(item);
            } else {
                return processValue(item);
            }
        });
    
        // Combine all images from all responses
        const allImages = processedResponses.flatMap(r => r.images);
        
        // Generate HTML for all responses
        const responsesHtml = processedResponses
            .map((formatted, index) => {
                const imagesCard = formatted.images.length > 0 ? `
                    <div style="
                        margin-bottom: 4px;
                        padding: 4px 6px;
                        background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'};
                        border-radius: 6px;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                        display: flex;
                        flex-wrap: wrap;
                        gap: 2px;
                    ">
                        ${formatted.images.map(img => `
                            <div style="
                                border-radius: 4px;
                                overflow: hidden;
                                width: 200px; 
                                height: 150px; 
                                box-shadow: 0 1px 2px rgba(0,0,0,0.06);
                                background: #f4f4f4;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <img 
                                    src="${img}" 
                                    alt="Response image" 
                                    style="width: 100%; height: 100%; object-fit: cover;" 
                                />
                            </div>
                        `).join('')}
                    </div>
                ` : '';
    
                const detailsCard = formatted.content ? `
                    <div style="
                        padding: 6px 10px;
                        background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
                        border-radius: 6px;
                        border-left: 2px solid ${theme.palette.primary.main};
                        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                    ">
                        ${formatted.content}
                    </div>
                ` : '';
    
                return `
                    <div style="
                        margin-bottom: 8px;
                        padding: 5px 10px;
                        background: ${theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'};
                        border-radius: 10px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    ">
                        ${imagesCard}${detailsCard}
                    </div>
                `;
            })
            .join('');
    
        // Add download button only once at the end if referenceUrl exists
        const downloadButton = referenceUrl ? `
            <div style="margin-top: 8px; text-align: center;">
                <a href="${referenceUrl}" target="_blank" rel="noopener noreferrer" style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 4px 8px;
                    background-color: ${theme.palette.primary.main};
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                    &:hover {
                        background-color: ${theme.palette.primary.dark};
                    }
                ">
                    Download Proposal
                </a>
            </div>
        ` : '';
    
        responseText = `
            <div>
                ${responsesHtml}
                ${downloadButton}
            </div>
        `;
    } else if (typeof response === 'object') {
        // Keep the existing object handling code as is, since it's only one response
        const formatted = formatObject(response);
        const downloadButton = referenceUrl ? `
            <div style="margin-top: 8px; text-align: center;">
                <a href="${referenceUrl}" target="_blank" rel="noopener noreferrer" style="
                    display: inline-block;
                    padding: 8px 16px;
                    background-color: ${theme.palette.primary.main};
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                    &:hover {
                        background-color: ${theme.palette.primary.dark};
                    }
                ">
                    Download Proposal
                </a>
            </div>
        ` : '';
    
        responseText = `
            <div style="
                margin-bottom: 8px;
                padding: 10px;
                background: ${theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'};
                border-radius: 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            ">
                ${formatted.images.length > 0 ? `
                    <div style="
                        margin-bottom: 6px;
                        padding: 4px;
                        background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'};
                        border-radius: 6px;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    ">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            ${formatted.images.map(img => `
                                <div style="border-radius: 4px; overflow: hidden;">
                                    <img src="${img}" alt="Response image" style="max-width: 100%; max-height: 140px; display: block;" />
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${formatted.content ? `
                    <div style="
                        padding: 6px 10px;
                        background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
                        border-radius: 6px;
                        border-left: 2px solid ${theme.palette.primary.main};
                        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                    ">
                        ${formatted.content}
                    </div>
                ` : ''}
                ${downloadButton}
            </div>
        `;
    } else {
        // Keep the existing simple response handling code as is
        const processed = processValue(response);
        responseText = `
            <div style="
                margin-bottom: 8px;
                padding: 10px;
                background: ${theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'};
                border-radius: 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            ">
                <div style="
                    padding: 6px 10px;
                    background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
                    border-radius: 6px;
                    border-left: 2px solid ${theme.palette.primary.main};
                    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                ">
                    ${processed.content}
                </div>
            </div>
        `;
    }
      
    }      

  
      console.log('Final response text:', responseText);
      console.log('Images found:', images);
  
      // Remove the loading message and add the actual response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          images,
          text: responseText,
          loading: false,
        };
        return newMessages;
      });
  
      setIsTyping(false);
  
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          text: errorMessage,
          loading: false
        };
        return newMessages;
      });
      
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewQuote = () => {
    refreshQuote();
    setMessages([]);
    setQuery('');
    setSelectedFiles([]);
  };


  useEffect(() => {
    refreshQuote();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <IconButton
        color="primary"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
          color: 'white',
          boxShadow: 3,
          zIndex: 1000,
          width: 56,
          height: 56,
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <SmartToyIcon fontSize="large" />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        TransitionComponent={Slide}
        PaperProps={{
          sx: {
            borderRadius: 4,
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' 
              : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            p: 2,
          }}
        >
          <Box display="flex" alignItems="center">
            <SmartToyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              AI Assistant
            </Typography>
          </Box>
          <Box>
            <Tooltip title="New Chat">
              <IconButton onClick={handleNewQuote} size="small" sx={{ mr: 1 }}>
                <AddCommentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              background: theme.palette.mode === 'dark' 
                ? 'radial-gradient(circle at 50% 30%, rgba(40,40,40,0.8) 0%, rgba(30,30,30,0.9) 100%)' 
                : 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.9) 100%)',
            }}
          >
            {messages.length === 0 ? (
              <Fade in={true} timeout={500}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 3,
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    <SmartToyIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    How can I help you today?
                  </Typography>
                  <Typography variant="body1" sx={{ maxWidth: '80%', mb: 3 }}>
                    Ask me anything, and I'll do my best to assist you.
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      maxWidth: '80%',
                      position: 'relative',
                    }}
                  >
                    <LightbulbIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontStyle="italic">
                      {currentQuote}
                    </Typography>
                    <Tooltip title="New quote">
                      <IconButton 
                        onClick={handleNewQuote} 
                        size="small" 
                        sx={{
                          position: 'absolute',
                          right: 4,
                          top: 4,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }}
                      >
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Fade>
            ) : (
              messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <Fade in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      {msg.sender === 'ai' && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                          }}
                        >
                          <SmartToyIcon fontSize="small" />
                        </Avatar>
                      )}
                      <Box
                        sx={{
                          bgcolor: msg.sender === 'user' 
                            ? 'primary.main' 
                            : theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.08)' 
                              : 'rgba(0, 0, 0, 0.05)',
                          color: msg.sender === 'user' ? 'white' : 'text.primary',
                          px: 2.5,
                          py: 1.5,
                          borderRadius: 4,
                          maxWidth: '85%',
                          whiteSpace: 'pre-wrap',
                          boxShadow: theme.shadows[1],
                          border: msg.sender === 'user' 
                            ? 'none' 
                            : `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                          overflow: 'hidden',
                          '& a': {
                            color: msg.sender === 'user' ? '#b3e0ff' : theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          },
                          '& strong': {
                            color: msg.sender === 'user' ? '#e6f2ff' : theme.palette.primary.main,
                            fontWeight: 600
                          }
                        }}
                      >
                        {msg.loading ? (
                          <Box display="flex" alignItems="center">
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: msg.sender === 'user' ? 'white' : 'primary.main',
                                mr: 1,
                                animation: 'pulse 1.5s infinite',
                                animationDelay: '0ms',
                              }}
                            />
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: msg.sender === 'user' ? 'white' : 'primary.main',
                                mr: 1,
                                animation: 'pulse 1.5s infinite',
                                animationDelay: '300ms',
                              }}
                            />
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: msg.sender === 'user' ? 'white' : 'primary.main',
                                animation: 'pulse 1.5s infinite',
                                animationDelay: '600ms',
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography 
                            variant="body2" 
                            component="div" 
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                            sx={{
                              '& p': { margin: '2px 0' },
                              '& ul, & ol': { 
                                paddingLeft: '20px',
                                margin: '2px 0'
                              },
                              '& li': { margin: '4px 0' }
                            }}
                          />
                        )}
                      </Box>
                      {msg.sender === 'user' && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            ml: 1.5,
                            bgcolor: 'primary.main',
                            color: 'white',
                          }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      )}
                    </Box>
                  </Fade>
                  {msg.sender === 'user' && msg.files && msg.files.length > 0 && (
                    <Fade in={true} timeout={500}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          mb: 2,
                          mr: 6,
                          gap: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        {msg.files.map((file, fileIndex) => (
                          <Card key={fileIndex} sx={{ maxWidth: 200 }}>
                            <CardMedia
                              component="img"
                              image={file.url}
                              alt={`Uploaded file ${fileIndex + 1}`}
                              sx={{
                                height: 140,
                                objectFit: 'contain',
                              }}
                            />
                            <Box sx={{ p: 1 }}>
                              <Typography variant="caption" noWrap>
                                {file.name}
                              </Typography>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    </Fade>
                  )}
                  {msg.sender === 'ai' && msg.images && msg.images.length > 0 && (
                    <Fade in={true} timeout={500}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          mb: 2,
                          ml: 6,
                          gap: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        {msg.images.map((img, imgIndex) => (
                          <Card key={imgIndex} sx={{ maxWidth: 200 }}>
                            <CardMedia
                              component="img"
                              image={img}
                              alt={`AI response image ${imgIndex + 1}`}
                              sx={{
                                height: 140,
                                objectFit: 'contain',
                              }}
                            />
                          </Card>
                        ))}
                      </Box>
                    </Fade>
                  )}
                </React.Fragment>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {selectedFiles.length > 0 && (
              <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeFile(index)}
                    sx={{
                      maxWidth: 200,
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }
                    }}
                  />
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                style={{ display: 'none' }}
              />
              <IconButton 
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                sx={{
                  color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                <AttachFileIcon />
              </IconButton>
              <TextField
                placeholder={isTyping ? "AI is typing..." : "Type your message..."}
                fullWidth
                multiline
                minRows={1}
                maxRows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isTyping}
                InputProps={{
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 4,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    '&.Mui-focused': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                    },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleSend} 
                        disabled={(!query.trim() && selectedFiles.length === 0) || isTyping}
                        sx={{
                          color: (query.trim() || selectedFiles.length > 0) ? 'primary.main' : 'text.disabled',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiAssistant;