"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Gift, Sparkles, Play, Pause, Volume2 } from "lucide-react"

export default function BirthdayPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isRevealed, setIsRevealed] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const birthdayImages = [
    "/WhatsAppImage(1).jpeg?height=200&width=700&text=Happy+Birthday+🎂",
    "/WhatsAppImage(2).jpeg?height=500&width=700&text=Beautiful+Memories+💝",
    "/WhatsAppImage(3).jpeg?height=500&width=700&text=Celebration+Time+🎉",
    "/WhatsAppImage(4).jpeg?height=500&width=700&text=Joy+and+Love+❤️",
    "/WhatsAppImage (5).jpeg?height=500&width=700&text=Special+Moments+✨",
  ]

  const birthdayPoem = `

  𝒯𝑜 𝒥𝓊𝓃𝑒, 𝑜𝓃 𝐻𝑒𝓇 𝒟𝒶𝓎  

  𝒜𝓃𝑜𝓉𝒽𝑒𝓇 𝓎𝑒𝒶𝓇, 𝒶 𝒷𝓇𝒾𝑔𝒽𝓉𝑒𝓇 𝒻𝓁𝒶𝓂𝑒,  
  𝒜 𝒽𝑒𝒶𝓇𝓉 𝓈𝑜 𝓌𝒶𝓇𝓂, 𝒶 𝓁❀𝓋𝑒𝓁𝓎 𝓃𝒶𝓂𝑒.  
  𝒯𝒽𝑒 𝓌❀𝓇𝓁𝒹 𝑔𝓇𝑒𝓌 𝓈❀𝒻𝓉𝑒𝓇 𝓌𝒽𝑒𝓃 𝓎❀𝓊 𝒸𝒶𝓂𝑒,  
  𝒜𝓃𝒹 𝓈𝓀𝒾𝑒𝓈 𝒽𝒶𝓋𝑒 𝓈𝓂𝒾𝓁𝑒𝒹 𝓈𝒾𝓃𝒸𝑒 𝓉𝒽𝑒𝓃 𝓉𝒽𝑒 𝓈𝒶𝓂𝑒.  

  𝒴❀𝓊𝓇  𝓁𝒶𝓊𝑔𝒽𝓉𝑒𝓇'𝓈 𝓁𝒾𝑔𝒽𝓉, 𝓎❀𝓊𝓇 𝓈𝓅𝒾𝓇𝒾𝓉 𝓉𝓇𝓊𝑒,  
  𝐿𝒾𝓀𝑒 𝓂❀𝓇𝓃𝒾𝓃𝑔 𝓈𝓉𝒶𝓇𝓈 𝒾𝓃 𝓈𝓀𝒾𝑒𝓈 𝑜𝒻 𝒷𝓁𝓊𝑒.  
  𝑀𝒶𝓎 𝒹𝓇𝑒𝒶𝓂𝓈 𝓊𝓃𝒻❀𝓁𝒹 𝒶𝓃𝒹 𝒻𝓁❀𝓌𝑒𝓇𝓈 𝒷𝓁❀❀𝓂,  
  𝒜𝓃𝒹 𝒿❀𝓎 𝒻𝒾𝓁𝓁 𝑒𝓋𝑒𝓇𝓎 𝒾𝓃𝒸𝒽 ❷𝒻 𝒥𝓊𝓃𝑒.  

  𝒮❀ 𝒽𝑒𝓇𝑒'𝓈 𝓉❀ 𝓎❀𝓊𝓎❀𝓊𝓇 𝓅𝒶𝓉𝒽, 𝓎❀𝓊𝓇 𝑔𝓇𝒶𝒸𝑒,  
  𝒯❀ 𝑒𝓋𝑒𝓇𝓎 𝓈𝓂𝒾𝓁𝑒 𝓊𝓅❀𝓃 𝓎❀𝓊𝓇 𝒻𝒶𝒸𝑒.  
  𝒜 𝓉❀𝒶𝓈𝓉 𝓉❀ 𝓁❀𝓋𝑒, 𝓉❀ 𝓅𝑒𝒶𝒸𝑒, 𝓉❀ 𝒸𝒽𝑒𝑒𝓇
  𝐻𝒶𝓅𝓅𝓎 𝐵𝒾𝓇𝓉𝒽𝒹𝒶𝓎, 𝒥𝓊𝓃𝑒 𝒟𝒶𝒶𝒽.  

  𝒮𝓉𝒶𝓎 𝓈❀𝒻𝓉, 𝓈𝓉𝒶𝓎 𝑔❀𝓁𝒹𝑒𝓃, 𝒿𝓊𝓈𝓉 𝒶𝓈 𝓎❀𝓊 𝒶𝓇𝑒 
  𝒴❀𝓊'𝓇𝑒 𝓉𝒽𝑒 𝓀𝒾𝓃𝒹 ❀𝒻 𝓈❀𝓊𝓁 𝓉𝒽𝒶𝓉 𝒻𝑒𝑒𝓁𝓈 𝓁𝒾𝓀𝑒 𝒶 𝓈𝓉𝒶 ✨
  `

  // Calculate time until tomorrow in Kenya time (EAT - UTC+3)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      // Convert to Kenya time (UTC+3)
      const kenyaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000)

      // Set tomorrow at midnight Kenya time
      const tomorrow = new Date(kenyaTime)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const difference = tomorrow.getTime() - kenyaTime.getTime()

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        setIsRevealed(true)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  // Image slideshow effect
  useEffect(() => {
    if (isRevealed) {
      const slideInterval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % birthdayImages.length)
      }, 4000) // Change image every 4 seconds

      return () => clearInterval(slideInterval)
    }
  }, [isRevealed, birthdayImages.length])

  // Initialize audio when revealed and auto-play
  useEffect(() => {
    if (isRevealed && !audioElement) {
      const audio = new Audio()
      // Add your birthday song file path here
      audio.src = "/Khalid_-_Better_ScaryBeatz.com.mp3"
      audio.loop = true
      audio.volume = 0.5
      setAudioElement(audio)
      
      // Auto-play the song when birthday page opens
      const playAudio = async () => {
        try {
          await audio.play()
          setIsPlaying(true)
        } catch (error) {
          console.log("Auto-play failed, user interaction required:", error)
          // If auto-play fails, we'll let the user manually start it
        }
      }
      
      playAudio()
    }
  }, [isRevealed, audioElement])

  const toggleMusic = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play().catch((error) => {
          console.log("Audio play failed:", error)
        })
        setIsPlaying(true)
      }
    }
  }

  const forceReveal = () => {
    setIsRevealed(true)
  }

  // Countdown Screen
  if (!isRevealed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #6495ED 0%, #FFF9F0 50%, #6495ED 100%)'}}>
        {/* Floating hearts animation - smooth flow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-blue-800 opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${8 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 8}s`,
                transform: `translateY(${Math.random() * 20 - 10}px)`,
              }}
              size={12 + Math.random() * 20}
            />
          ))}
        </div>

        {/* Sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-cyan-200 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
              size={8 + Math.random() * 12}
            />
          ))}
        </div>

        {/* Custom CSS for smooth floating animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            25% {
              transform: translateY(-10px) translateX(5px);
            }
            50% {
              transform: translateY(-5px) translateX(-5px);
            }
            75% {
              transform: translateY(-15px) translateX(8px);
            }
          }
        `}</style>

        <div className="text-center space-y-8 relative z-10 max-w-2xl mx-auto">
          <div className="animate-bounce">
            <Gift className="mx-auto text-white mb-6" size={100} />
          </div>

          <h1 className="text-4xl md:text-7xl font-bold text-black mb-4 animate-pulse">🎉 Birthday Surprise! 🎉</h1>

          <p className="text-xl md:text-2xl text-black/90 mb-8 font-medium">Something magical is about to happen...</p>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 md:p-8">
            <CardContent className="text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">⏰ Countdown to Magic ⏰</h2>

              <div className="text-black text-center space-y-4">
                <p className="text-lg md:text-xl opacity-90 font-medium">Kenya Time (EAT)</p>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="bg-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                    <div className="text-3xl md:text-4xl font-bold text-black">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm md:text-base opacity-80 font-medium text-black">Hours</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                    <div className="text-3xl md:text-4xl font-bold text-black">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm md:text-base opacity-80 font-medium text-black">Minutes</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                    <div className="text-3xl md:text-4xl font-bold text-black">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm md:text-base opacity-80 font-medium text-black">Seconds</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={forceReveal}
                className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-black font-bold py-4 px-8 rounded-full transform hover:scale-105 transition-all duration-300 text-lg"
              >
                <Sparkles className="mr-2" size={24} />
                Can't Wait? Reveal Now!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Birthday Reveal Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #6495ED 0%, #FFF9F0 30%, #6495ED 70%, #FFF9F0 100%)'}}>
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            {["🎉", "🎂", "🎈", "✨", "🎊", "💝", "🌟", "❤️", "🎁", "🥳"][Math.floor(Math.random() * 10)]}
          </div>
        ))}
      </div>

      {/* Floating hearts animation - smooth flow for birthday screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-blue-800 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              transform: `translateY(${Math.random() * 30 - 15}px)`,
            }}
            size={15 + Math.random() * 25}
          />
        ))}
      </div>

      {/* Custom CSS for smooth floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-15px) translateX(8px);
          }
          50% {
            transform: translateY(-8px) translateX(-8px);
          }
          75% {
            transform: translateY(-20px) translateX(12px);
          }
        }
      `}</style>

      {/* Music Control */}
      <div className="fixed top-6 right-6 z-20">
        <Button
          onClick={toggleMusic}
          className="bg-white/20 backdrop-blur-lg border-white/30 text-black hover:bg-white/30 rounded-full p-4 shadow-lg"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          <Volume2 className="ml-2" size={20} />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-7xl font-bold text-black mb-6 animate-bounce">🎂 HAPPY BIRTHDAY JUNE! 🎂</h1>
          <p className="text-2xl md:text-3xl text-black/90 font-medium">Your special day is finally here! 🥳</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Image Slideshow */}
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="relative h-96 md:h-[500px] overflow-hidden">
                <img
                  src={birthdayImages[currentImageIndex] || "/placeholder.svg"}
                  alt={`Birthday memory ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover object-center transition-all duration-1000 transform hover:scale-105"
                />

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {birthdayImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>

                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {birthdayImages.length}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Birthday Poem */}
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="text-black/95 leading-relaxed whitespace-pre-line text-center text-sm md:text-base max-h-96 overflow-y-auto">
                {birthdayPoem}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Birthday Wishes Section */}
        <div className="mt-12 text-center">
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 max-w-4xl mx-auto shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-6">A Message for You, June Daah 💛</h3>

              <p className="text-base md:text-lg text-black/95 mb-6 leading-relaxed font-normal">
                You are soft in a world that often forgets how to be gentle.
                You are light in moments when others can't see the way.
                You carry warmth like a quiet sunrise...never loud, but always felt.
              </p>
              
              <p className="text-base md:text-lg text-black/95 mb-6 leading-relaxed font-normal">
                This birthday, I just want you to know:
                You are deeply loved, beautifully made, and endlessly enough.
              </p>
              
              <div className="flex justify-center space-x-4 text-3xl md:text-4xl mb-6">🎈🎂🎉🎁✨</div>
              
              <p className="text-base md:text-lg text-black/90 font-medium">
                Happy Birthday, June Daah.
                Never stop being your soft, beautiful self. 🌸
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}