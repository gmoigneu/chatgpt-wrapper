import {useState, useEffect} from 'react';
import {useAppStore} from "./lib/store";
import {getMessages} from "./lib/api";
import {PaperAirplaneIcon, RocketLaunchIcon, UserCircleIcon} from "@heroicons/react/24/outline";
import { toast } from 'react-toastify'
import {EventStreamContentType, fetchEventSource} from '@microsoft/fetch-event-source'
class RetriableError extends Error { }
class FatalError extends Error { }

const Chat = (props) => {

    const [messages, setMessages] = useState([]);
    const [isGettingAnswers, setIsGettingAnswers] = useState(false)
    const [promptRows, setPromptRows] = useState(1)
    const [newMessage, setNewMessage] = useState('')

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    function uuidv4() {
        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
            (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
        )
    }

    const handleKeyPress = event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            sendMessage()
            event.preventDefault()
        }
    }

    const promptChange = target => {
        setNewMessage(target.value)

        const rowHeight = 24
        setPromptRows(Math.ceil(target.scrollHeight / rowHeight))
    }

    const sendMessage = async () => {
        if (!newMessage) return

        if (newMessage.length > 2000) {
            toast.error('Prompt is too long. Maximum length is 2000 characters.', {
                position: toast.POSITION.BOTTOM_RIGHT,
                toastId: 'prompt-error',
            })
            return
        }

        let content = newMessage
        setPromptRows(1)

        newStreamResponse(props.chat, content).then(() => {})

        setNewMessage('')
    }

    const newStreamResponse = async (chat, prompt) => {
        const ctrl = new AbortController()
        setNewMessage('')

        let messageContent = ''
        setIsGettingAnswers(true)

        setMessages(messages => [...messages, {
            id: uuidv4(),
            chat_id: chat.id,
            content: `${prompt}`,
            role: 'user',
        }])

        let scroller = document.getElementById('scroller')
        scroller.scrollTo(0, scroller.scrollHeight)

        await fetchEventSource(`${process.env.REACT_APP_BASE_URL}/chat/${chat.id}/message`, {
            method: 'POST',
            openWhenHidden: true,
            body: JSON.stringify({
                content: prompt,
            }),

            onopen (res) {
            },

            onmessage(ev) {
                let tmp = JSON.parse(ev.data)

                if (tmp.chunk !== null) {
                    messageContent += tmp.chunk
                    if (tmp.index === 1) {
                        setMessages(messages => [...messages, {
                            id: tmp.id,
                            chat_id: chat.id,
                            content: messageContent,
                            role: 'assistant',
                            object: 'chat.completion',
                        }])
                    } else {
                        setMessages(messages => messages.map(m => (m.id === tmp.id ? {
                            id: tmp.id,
                            chat_id: chat.id,
                            content: messageContent,
                            role: 'assistant',
                            object: 'chat.completion',
                        } : m)))
                        let scroller = document.getElementById('scroller')
                        scroller.scrollTo(0, scroller.scrollHeight)
                    }
                }
            },
            onclose() {
                // do not retry
                ctrl.abort()
            },
            onerror(err) {
                console.log(err)
                toast.error('Something unexpected happened.', {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    toastId: 'prompt-error',
                })
                ctrl.abort()
                throw err;
            },
            signal: ctrl.signal,
        }).then(() => {
            setIsGettingAnswers(false)
        })
    }

    useEffect(() => {
        getMessages(props.chat.id).then(r => setMessages(r.data));
    }, [props.chat])

    return (
        <div className="Chat h-full">
            <div id="scroller" className="pb-20 scroll-smooth h-full overflow-y-auto w-full">
                <div>
                {messages.map(message => (
                    <div className="bg-gray-800 mx-auto max-w-7xl sm:px-6 lg:px-8 my-4 py-4 py-0 rounded-lg"
                         key={'message_' + message.id}>
                        <div className="flex">
                            <div className="mr-4 flex-shrink-0">
                                {message.role === 'user' && (<UserCircleIcon className="h-12 w-12 text-gray-300"/>)}
                                {message.role === 'assistant' && (
                                    <RocketLaunchIcon className="h-12 w-12 text-gray-300"/>)}
                            </div>
                            <div>
                                <p className="mt-1">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="fixed z-40 bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-ac-dark-purple md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2 md:pl-2 md:w-[calc(100%-.5rem)]">
                <div className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-2 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                    <div className="relative flex h-full flex-1 items-stretch flex-col">
                        <div className="flex w-full items-center">
                            {!isGettingAnswers && (
                                <div className="flex flex-col w-full py-[10px] flex-grow md:py-4 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-ac-gray1 rounded-xl shadow-xs dark:shadow-xs">
                                                            <textarea
                                                                id="prompt-textarea"
                                                                tabIndex="0"
                                                                rows={promptRows}
                                                                onKeyPress={handleKeyPress}
                                                                placeholder="Send a message"
                                                                disabled={isGettingAnswers}
                                                                className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-10 ring-0 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pr-12 pl-3 md:pl-0 text-black"
                                                                value={newMessage}
                                                                onChange={e => promptChange(e.target)}
                                                                style={{
                                                                    maxHeight: '200px',
                                                                    overflowY: 'hidden',
                                                                }}
                                                            />
                                    <button
                                        onClick={sendMessage}
                                        className="absolute p-1 rounded-md md:bottom-3 md:p-2 top-2 md:right-3 dark:hover:bg-gray-900 dark:disabled:hover:bg-transparent right-2 disabled:text-gray-400 enabled:bg-brand-purple text-white bottom-1.5 transition-colors disabled:opacity-40">
                                        <PaperAirplaneIcon className="text-ac-gray4 h-6 w-6" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div
                            className={classNames(
                                newMessage.length > 1500 ? 'text-ac-burnt-sienna font-bold' : 'text-ac-gray4',
                                'text-xs text-center mx-auto mt-2',
                            )}>
                            {newMessage.length} / 2000 characters max.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
