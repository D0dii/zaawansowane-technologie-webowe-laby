"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SOCKET_URL = "ws://localhost:3000";

type Message =
  | {
      id: string;
      author: string;
      message: string;
      date: string;
      type: "message";
    }
  | { id: string; author: string; date: string; imgUrl: string; type: "image" };

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [messageHistory, setMessageHistory] = useState<(Message | string)[]>([]);
  const [room, setRoom] = useState(1);
  const socket = useRef<Socket | null>(null);
  const [someoneTyping, setSomeoneTyping] = useState("");

  useEffect(() => {
    if (!nickname) {
      return;
    }
    socket.current = io(SOCKET_URL, {
      query: {
        nickname: nickname,
      },
    });
    socket.current.on("message", (arg) => {
      setMessageHistory((prev) => [...prev, arg]);
    });
    socket.current.on("typing", (arg) => {
      setSomeoneTyping(arg);
    });
    socket.current.on("stop_typing", () => {
      setSomeoneTyping("");
    });
    socket.current.on("image_message", (data) => {
      setMessageHistory((prev) => [...prev, data]);
      //img.src = `http://localhost:3000/uploads/${path.basename(data.imagePath)}`;
    });
  }, [nickname]);

  if (!nickname) {
    return (
      <form
        className="flex flex-col items-center gap-8 mt-32 px-56"
        action={(formData: FormData) => {
          const nicknameInput = formData.get("nickname");
          if (!nicknameInput) {
            alert("Nickname is required");
            return;
          }
          setNickname(nicknameInput as string);
        }}
      >
        <Input name="nickname" placeholder="Enter your nickname" />
      </form>
    );
  }

  const changeRoom = (roomNumber: number) => {
    if (roomNumber !== room) {
      setMessageHistory([]);
      setRoom(roomNumber);
      socket.current?.emit("switch_room", roomNumber);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-10 px-56 mb-8">
      <h1 className="text-3xl font-bold">Super ultra chat room</h1>
      <div className="flex gap-4">
        <Button disabled={room === 1} onClick={() => changeRoom(1)}>
          1
        </Button>
        <Button disabled={room === 2} onClick={() => changeRoom(2)}>
          2
        </Button>
        <Button disabled={room === 3} onClick={() => changeRoom(3)}>
          3
        </Button>
      </div>
      <div className="flex flex-col gap-4 items-center w-full">
        {messageHistory.map((message) =>
          typeof message === "string" ? (
            <div key={message}>{message}</div>
          ) : message.type === "message" ? (
            <Card
              className={`w-[350px] ${message.author === nickname ? "self-end" : "self-start"}`}
              key={message.id}
            >
              <CardHeader>
                <CardTitle>{message.author}</CardTitle>
                <CardDescription>{new Date(message.date).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>{message.message}</CardContent>
            </Card>
          ) : (
            <div>image here</div>
          )
        )}
      </div>
      {someoneTyping !== "" ? <span>{someoneTyping}</span> : ""}
      <form
        action={(formData: FormData) => {
          const input = formData.get("message");
          if (input && socket.current) {
            socket.current.emit("send_message", {
              id: crypto.randomUUID(),
              author: nickname,
              date: new Date(),
              message: input,
              type: "message",
            });
            socket.current.emit("stop_typing");
          }
        }}
        className="flex gap-4"
      >
        <Input
          name="message"
          placeholder="Enter your message"
          onChange={(e) => {
            console.log(e.target.value);
            if (e.target.value !== "" && socket.current) {
              socket.current.emit("typing");
            } else if (e.target.value === "" && socket.current) {
              socket.current.emit("stop_typing");
            }
          }}
        />
      </form>
    </div>
  );
}
