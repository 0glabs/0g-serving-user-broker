# Chat History Search Functionality

## Overview

The chat history search functionality allows users to search through their chat messages and jump directly to the conversation containing the search result.

## Features

### ✅ **Search Implementation**

1. **Real-time Search**
   - 300ms debounced search to avoid excessive API calls
   - Searches through message content using case-insensitive pattern matching
   - Wallet-based isolation (only searches current wallet's messages)

2. **Search Results Display**
   - Shows message preview (truncated to 100 characters)
   - Displays message role (You/Assistant)
   - Shows timestamp
   - Visual "View →" indicator for clickable results

3. **Session Jump Functionality**
   - Clicking a search result loads the corresponding chat session
   - Automatically clears search and returns to normal chat view
   - Uses `handleHistoryClick` to load the session properly

### 🔧 **Technical Implementation**

#### Database Schema
```sql
-- Search query joins messages with sessions for wallet isolation
SELECT cm.* FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.session_id
WHERE cm.content ILIKE $1 
  AND cs.wallet_address = $2
ORDER BY cm.timestamp DESC 
LIMIT 100
```

#### Data Flow
1. **User Input** → `searchQuery` state
2. **Debounced Effect** → 300ms delay
3. **Database Query** → `chatHistory.searchMessages()`
4. **Results Processing** → Add `sessionId` to results
5. **Display** → Clickable result cards
6. **Click Handler** → `handleHistoryClick(result.sessionId)`

#### Key Components

**Search State Management:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<(Message & { sessionId: string })[]>([]);
const [isSearching, setIsSearching] = useState(false);
```

**Debounced Search Effect:**
```typescript
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await chatHistory.searchMessages(searchQuery);
      const searchMessages = results.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        chatId: msg.chat_id,
        isVerified: msg.is_verified,
        isVerifying: msg.is_verifying,
        sessionId: msg.session_id || '',
      }));
      setSearchResults(searchMessages);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  return () => clearTimeout(timeoutId);
}, [searchQuery]);
```

**Click Handler:**
```typescript
onClick={async () => {
  if (result.sessionId && !isLoading && !isStreaming) {
    try {
      setSearchQuery('');
      setSearchResults([]);
      await handleHistoryClick(result.sessionId);
    } catch (err) {
      console.error('Failed to load session from search result:', err);
    }
  }
}}
```

### 🎯 **User Experience**

1. **Search Input**
   - Type keywords in the search box
   - Real-time feedback with loading indicator
   - Clear search to return to session list

2. **Search Results**
   - Preview of matching messages
   - Clear visual hierarchy (role, date, content)
   - Hover effects indicate interactivity
   - "View →" call-to-action

3. **Session Navigation**
   - Click result → Jump to conversation
   - Search clears automatically
   - Full conversation loads with context
   - Previous search context is maintained

### 🛡️ **Error Handling**

- **Network Failures**: Graceful error handling with console logging
- **Invalid Sessions**: Protected against missing sessionId
- **Loading States**: Disabled interactions during loading/streaming
- **Empty Results**: User-friendly "No results found" message

### 🔍 **Search Behavior**

- **Case Insensitive**: Searches match regardless of case
- **Partial Matching**: Uses `ILIKE %pattern%` for substring matching  
- **Wallet Isolation**: Only searches current wallet's messages
- **Recent First**: Results ordered by timestamp (newest first)
- **Limited Results**: Maximum 100 results to prevent performance issues

## Usage Examples

### Basic Search
1. Open chat history sidebar
2. Type search term (e.g., "javascript")
3. View matching results
4. Click any result to jump to that conversation

### Advanced Search Tips
- Search for specific terms or phrases
- Use partial words for broader results
- Search works across all your conversations
- Results show both your messages and AI responses

## Performance Considerations

- **Debouncing**: 300ms delay prevents excessive database queries
- **Result Limiting**: Maximum 100 results per search
- **Index Optimization**: Database has composite indexes for fast queries
- **Memory Management**: Search results cleared when not needed

## Future Enhancements

- **Highlight Matches**: Highlight search terms in results
- **Advanced Filters**: Filter by date range, message type, etc.
- **Search History**: Remember recent searches
- **Keyboard Navigation**: Arrow keys to navigate results
- **Deep Linking**: Direct URLs to specific messages