import * as React from "react"
import { Send } from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function CardsChat() {
    const [messages, setMessages] = React.useState([
		{
			"role": "assistant",
			"content": "Bedankt voor het delen van die informatie. Om een beter beeld te krijgen, hoe zou u de klacht van uw kind willen omschrijven?",
			"question_index": 1,
			"quick_reply_options": [
				"Keelpijn",
				" Hoofdpijn",
				" Buikpijn"
			]
		}
    ]);

    const [input, setInput] = React.useState("");
	const [showTypingIndicator, setShowTypingIndicator] = React.useState(false);
	const [quickReplyOptions, setQuickReplyOptions] = React.useState(messages.at(0)?.quick_reply_options || []); //'Joepie', 'Nee', 'Onbekend'
    const inputLength = input.trim().length;

	async function handleSubmit(event, option = null) {
		console.log('handleSubmit', option)
		event.preventDefault();
		if (inputLength === 0 && option === null) return;
	
		const latestAssistantMessage = messages.filter(message => message.role === "assistant").at(-1);
		const newQuestionIndex = latestAssistantMessage.question_index + 1;
		const answer = option !== null ? option : input;
	
		// First, update with the user's message
		setMessages(prevMessages => [
			...prevMessages,
			{
				role: "user",
				content: answer,
			},
		]);
	
		setInput("");
		setShowTypingIndicator(true);
		setQuickReplyOptions([]);
	
		// Then, get the API response
		const apiResponse = await axios.post('https://seal-app-km7kw.ondigitalocean.app/question/', {
			"question_index": newQuestionIndex,
			"previous_question": latestAssistantMessage.content,
			"previous_answer": answer
		});

		setShowTypingIndicator(false);
		setQuickReplyOptions(apiResponse.data.quick_reply_options);
		
		console.log(apiResponse.data);
	
		// Finally, update with the assistant's message
		setMessages(prevMessages => [
			...prevMessages,
			{
				role: "assistant",
				content: apiResponse.data.rephrased_question,
				question_index: newQuestionIndex,
			},
		]);
	}
	

	return (
		<Card className="max-w-xl w-full">
			<CardHeader className="flex flex-row items-center">
			<div className="flex items-center space-x-4">
				<Avatar>
				<AvatarImage src="/avatars/01.png" alt="Image" />
				<AvatarFallback>NR</AvatarFallback>
				</Avatar>
				<div>
				<p className="text-sm font-medium leading-none">Nolan Rook</p>
				<p className="text-sm text-muted-foreground">m@example.com</p>
				</div>
			</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{
						messages.map((message, index) => (
						<div
							key={index}
							className={cn(
							"flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
							message.role === "user"
								? "ml-auto bg-primary text-primary-foreground"
								: "bg-muted"
							)}
						>
							{message.content}
						</div>
					))
					}
					{showTypingIndicator && (
						<div className="w-fit py-1 text-xs font-medium leading-none text-center rounded-md animate-pulse">Aan het typen...</div>
					)}
					{
						quickReplyOptions.length > 0 && (
							<div className="flex flex-row-reverse gap-2 mt-4">
								{quickReplyOptions.map((option, index) => (
									<Badge key={index} className="cursor-pointer" variant="outline" onClick={(e) => handleSubmit(e, option)}>{option}</Badge>
								))}
							</div>
						)
					}
				</div>
			</CardContent>
			<CardFooter>
				<form
					onSubmit={(e) => handleSubmit(e)}
					className="flex w-full items-center space-x-2"
				>
					<Input
						id="message"
						placeholder="Type your message..."
						className="flex-1"
						autoComplete="off"
						value={input}
						onChange={(event) => setInput(event.target.value)}
					/>
					<Button type="submit" size="icon" disabled={inputLength === 0}>
					<Send className="h-4 w-4" />
					<span className="sr-only">Send</span>
					</Button>
				</form>
			</CardFooter>
		</Card>
	)
}