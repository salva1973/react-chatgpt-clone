import { useState, useEffect } from 'react'

import LoadingSpinner from './components/LoadingSpinner'

const COST_PER_1000_TOKENS = 0.002 // $

const App = () => {
  const [value, setValue] = useState('')
  const [message, setMessage] = useState(null)
  const [previousChats, setPreviousChats] = useState([])
  const [currentTitle, setCurrentTitle] = useState('')
  const [totalCost, setTotalCost] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const createNewChat = () => {
    setMessage(null)
    setValue('')
    setCurrentTitle('')
  }

  const handleClick = uniqueTitle => {
    setCurrentTitle(uniqueTitle)
    setMessage(null)
    setValue('')
  }

  const handleKeyPress = e => {
    if (e.keyCode === 13) {
      getMessages()
    }
  }

  const getMessages = async () => {
    setIsLoading(true)
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: value,
        }),
      }
      const response = await fetch('http://localhost:3000/completions', options)
      const data = await response.json()
      const cost = (data.usage.total_tokens * COST_PER_1000_TOKENS) / 1000
      setTotalCost(prevCost => parseFloat((prevCost + cost).toFixed(5)))

      setIsLoading(false)

      setMessage(data.choices[0].message)      
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  useEffect(() => {
    setIsLoading(false)
    if (!currentTitle && value && message) {
      setCurrentTitle(value)
    }
    if (currentTitle && value && message) {
      setPreviousChats(prevChats => [
        ...prevChats,
        {
          title: currentTitle,
          role: 'user',
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ])
      setValue('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, currentTitle])

  const currentChat = previousChats.filter(
    previousChat => previousChat.title === currentTitle
  )
  const uniqueTitles = Array.from(
    new Set(previousChats.map(previousChat => previousChat.title))
  )

  return (
    <div className='app'>
      <section className='side-bar'>
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className='history'>
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>
          <p>Total Cost: ${totalCost}</p>
        </nav>
      </section>
      <section className='main'>
        {!currentTitle && <h1>SalvaGPT</h1>}
        <ul className='feed'>
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <p className='role'>{chatMessage.role}</p>
              <p>{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        {isLoading && <LoadingSpinner />}
        <div className='bottom-section'>
          <div className='input-container'>
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div id='submit' onClick={getMessages}>
              ➢
            </div>
          </div>
          <div className='info'>
            ChatGPT Mar 14 version. Free Research Preview. Our goal is to make
            AI systems more natural and safe to interact with. Your feedback
            will help us to improve.
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
