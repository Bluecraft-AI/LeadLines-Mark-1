import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AssistantService from '../../services/AssistantService';
import { FiSend, FiPlus, FiTrash2, FiPaperclip, FiList } from 'react-icons/fi';

const AgentPage = () => {
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [assistantError, setAssistantError] = useState(null);
  const [showThreads, setShowThreads] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize assistant and load threads
  useEffect(() => {
    if (currentUser) {
      initializeAssistant();
      loadThreads();
      loadFiles();
    }
  }, [currentUser]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeAssistant = async () => {
    setLoading(true);
    try {
      const { assistantId, error } = await AssistantService.getUserAssistant(currentUser.uid);
      if (error) {
        setAssistantError("Could not find an AI Assistant associated with your account. Please contact support.");
        throw error;
      }
      setAssistantId(assistantId);
      setAssistantError(null);
    } catch (error) {
      console.error('Error initializing assistant:', error);
      setAssistantError("Could not find an AI Assistant associated with your account. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const loadThreads = async () => {
    try {
      const { threads, error } = await AssistantService.getUserThreads(currentUser.uid);
      if (error) throw error;
      setThreads(threads);
      
      // If there are threads, select the most recent one
      if (threads.length > 0) {
        setCurrentThread(threads[0]);
        // In a real implementation, we would load messages for this thread
        // For now, we'll use placeholder messages
        setMessages([
          { role: 'assistant', content: 'Hello! How can I help you today?' }
        ]);
      } else {
        // Create a new thread if none exist
        createNewThread();
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const loadFiles = async () => {
    try {
      const { files, error } = await AssistantService.getUserFiles(currentUser.uid);
      if (error) throw error;
      setFiles(files);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const createNewThread = async () => {
    if (!assistantId) {
      setAssistantError("No AI Assistant found for your account. Please contact support.");
      return;
    }
    
    setLoading(true);
    try {
      const { thread, error } = await AssistantService.createThread(currentUser.uid);
      if (error) throw error;
      
      setThreads(prevThreads => [thread, ...prevThreads]);
      setCurrentThread(thread);
      setMessages([
        { role: 'assistant', content: 'Hello! How can I help you today?' }
      ]);
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentThread || !assistantId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { response, error } = await AssistantService.sendMessage(
        currentThread.thread_id, 
        input, 
        currentUser.uid
      );
      
      if (error) throw error;
      
      // Add assistant response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !assistantId) return;

    setUploading(true);
    try {
      const { file: uploadedFile, error } = await AssistantService.uploadFile(
        file, 
        currentUser.uid, 
        assistantId
      );
      
      if (error) throw error;
      
      setFiles(prev => [uploadedFile, ...prev]);
      
      // Notify the user that the file was uploaded
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `File "${file.name}" has been uploaded and is now available to the assistant.` 
      }]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I couldn't upload the file "${file.name}". Please try again.` 
      }]);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const { success, error } = await AssistantService.deleteThread(threadId, currentUser.uid);
      if (error) throw error;
      
      // Remove thread from state
      setThreads(prev => prev.filter(t => t.thread_id !== threadId));
      
      // If the deleted thread was the current one, select another or create a new one
      if (currentThread?.thread_id === threadId) {
        if (threads.length > 1) {
          const newCurrentThread = threads.find(t => t.thread_id !== threadId);
          setCurrentThread(newCurrentThread);
          // In a real implementation, we would load messages for this thread
          setMessages([
            { role: 'assistant', content: 'Hello! How can I help you today?' }
          ]);
        } else {
          createNewThread();
        }
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const { success, error } = await AssistantService.deleteFile(fileId, currentUser.uid);
      if (error) throw error;
      
      // Remove file from state
      setFiles(prev => prev.filter(f => f.file_id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const switchThread = (thread) => {
    setCurrentThread(thread);
    // In a real implementation, we would load messages for this thread
    // For now, we'll use placeholder messages
    setMessages([
      { role: 'assistant', content: 'Hello! How can I help you today?' }
    ]);
    setShowThreads(false);
  };

  // If there's an assistant error, show a message
  if (assistantError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-700">AI Assistant Not Available</h2>
          <p className="mb-4 text-gray-700">
            {assistantError}
          </p>
          <button
            onClick={initializeAssistant}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-2xl font-bold">AI Assistant</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowThreads(!showThreads)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Show conversations"
          >
            <FiList />
          </button>
          <button 
            onClick={createNewThread}
            className="p-2 rounded-full hover:bg-gray-100"
            title="New conversation"
            disabled={!assistantId}
          >
            <FiPlus />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Upload file"
            disabled={uploading || !assistantId}
          >
            <FiPaperclip />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thread sidebar (conditionally shown) */}
        {showThreads && (
          <div className="w-64 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium mb-2">Conversations</h3>
              <ul>
                {threads.map(thread => (
                  <li 
                    key={thread.thread_id} 
                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                      currentThread?.thread_id === thread.thread_id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span 
                      className="truncate flex-1"
                      onClick={() => switchThread(thread)}
                    >
                      {thread.title || 'New Conversation'}
                    </span>
                    <button 
                      onClick={() => handleDeleteThread(thread.thread_id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              
              <h3 className="font-medium mt-6 mb-2">Files</h3>
              <ul>
                {files.map(file => (
                  <li 
                    key={file.file_id} 
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-100"
                  >
                    <span className="truncate flex-1" title={file.filename}>
                      {file.filename}
                    </span>
                    <button 
                      onClick={() => handleDeleteFile(file.file_id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || !currentThread || !assistantId}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || !input.trim() || !currentThread || !assistantId}
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage; 