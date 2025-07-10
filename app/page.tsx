"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Gift, Sparkles, Play, Pause, Volume2, ArrowRight } from "lucide-react"

export default function BirthdayPage() {
  const [currentPage, setCurrentPage] = useState('countdown') // 'countdown', 'poem', 'message', 'images'
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState(null)

  const birthdayImages = [
    "/WhatsAppImage(1).jpeg?height=200&width=700&text=Happy+Birthday+🎂",
    "/WhatsAppImage(2).jpeg?height=500&width=700&text=Beautiful+Memories+💝",
    "/WhatsAppImage(3).jpeg?height=500&width=700&text=Celebration+Time+🎉",
    "/WhatsAppImage(4).jpeg?height=500&width=700&text=Joy+and+Love+❤️",
    "/WhatsAppImage (5).jpeg?height=500&width=700&text=Special+Moments+✨",
    "/WhatsAppImage6.jpeg?height=500&width=700&text=Birthday+Vibes+🎈",
    "/WhatsAppImage(7).jpeg?height=500&width=700&text=Cheers+to+You+🥳",
    "/WhatsAppImage(8).jpeg?height=500&width=700&text=You+Are+Loved+💖",
    "/WhatsAppImage(9).jpeg?height=500&width=700&text=Birthday+Joy+🎊",
    "/WahatsAppImage(10).jpeg?height=500&width=700&text=Happy+Birthday+June+Daah+🎂",
    "/WhatsAppImage(11).jpeg?height=500&width=700&text=Birthday+Memories+🌟",
    "/WhatsAppImage(12).jpeg?height=500&width=700&text=Birthday+Love+💞",
    "/WhatsAppImage(13).jpeg?height=500&width=700&text=Birthday+Wishes+🌸",
  ]

  const birthdayPoem = `

  𝒯𝑜 𝒥𝓊𝓃𝑒, 𝑜𝓃 𝐻𝑒𝓇 𝒟𝒶𝓎  

  𝒜𝓃𝑜𝓉𝒽𝑒𝓇 𝓎𝑒𝒶𝓇, 𝒶 𝒷𝓇𝒾𝑔𝒽𝓉𝑒𝓇 𝒻𝓁𝒶𝓂𝑒,  
  𝒜 𝒽𝑒𝒶𝓇𝓉 𝓈𝑜 𝓌𝒶𝓇𝓂, 𝒶 𝓁❀𝓋𝑒𝓁𝓎 𝓃𝒶𝓂𝑒.  
  𝒯𝒽𝑒 𝓌❀𝓇𝓁𝒹 𝑔𝓇𝑒𝓌 𝓈❀𝒻𝓉𝑒𝓇 𝓌𝒽𝑒𝓃 𝓎❀𝓊 𝒸𝒶𝓂𝑒,  
  𝒜𝓃𝒹 𝓈𝓀𝒾𝑒𝓈 𝒽𝒶𝓋𝑒 𝓈𝓂𝒾𝓁𝑒𝒹 𝓈𝒾𝓃𝒸𝑒 𝓉𝒽𝑒𝓃 𝓉𝒽𝑒 𝓈𝒶𝓂𝑒.  

  𝒴❀𝓊𝓇 𝓁𝒶𝓊𝑔𝒽𝓉𝑒𝓇'𝓈 𝓁𝒾𝑔𝒽𝓉, 𝓎❀𝓊𝓇 𝓈𝓅𝒾𝓇𝒾𝓉 𝓉𝓇𝓊𝑒,  
  𝐿𝒾𝓀𝑒 𝓂❀𝓇𝓃𝒾𝓃𝑔 𝓈𝓉𝒶𝓇𝓈 𝒾𝓃 𝓈𝓀𝒾𝑒𝓈 𝑜𝒻 𝒷𝓁𝓊𝑒.  
  𝑀𝒶𝓎 𝒹𝓇𝑒𝒶𝓂𝓈 𝓊𝓃𝒻❀𝓁𝒹 𝒶𝓃𝒹 𝒻𝓁❀𝓌𝑒𝓇𝓈 𝒷𝓁❀❀𝓂,  
  𝒜𝓃𝒹 𝒿❀𝓎 𝒻𝒾𝓁𝓁 𝑒𝓋𝑒𝓇𝓎 𝒾𝓃𝒸𝒽 ❀𝒻 𝒥𝓊𝓃𝑒.  

  𝒮❀ 𝒽𝑒𝓇𝑒'𝓈 𝓉❀ 𝓎❀𝓊, 𝓎❀𝓊𝓇 𝓅𝒶𝓉𝒽, 𝓎❀𝓊𝓇 𝑔𝓇𝒶𝒸𝑒,  
  𝒯❀ 𝑒𝓋𝑒𝓇𝓎 𝓈𝓂𝒾𝓁𝑒 𝓊𝓅❀𝓃 𝓎❀𝓊𝓇 𝒻𝒶𝒸𝑒.  
  𝒜 𝓉❀𝒶𝓈𝓉 𝓉❀ 𝓁❀𝓋𝑒, 𝓉❀ 𝓅𝑒𝒶𝒸𝑒, 𝓉❀ 𝒸𝒽𝑒𝑒𝓇—  
  𝐻𝒶𝓅𝓅𝓎 𝐵𝒾𝓇𝓉𝒽𝒹𝒶𝓎, 𝒥𝓊𝓃𝑒 𝒟𝒶𝒶𝒽.  

  𝒮𝓉𝒶𝓎 𝓈❀𝒻𝓉, 𝓈𝓉𝒶𝓎 𝑔❀𝓁𝒹𝑒𝓃, 𝒿𝓊𝓈𝓉 𝒶𝓈 𝓎❀𝓊 𝒶𝓇𝑒—  
  𝒴❀𝓊'𝓇𝑒 𝓉𝒽𝑒 𝓀𝒾𝓃𝒹 ❀𝒻 𝓈❀𝓊𝓁 𝓉𝒽𝒶𝓉 𝒻𝑒𝑒𝓁𝓈 𝓁𝒾𝓀𝑒 𝒶 𝓈𝓉𝒶𝓇 ✨
  `

  // Image slideshow effect
  useEffect(() => {
    if (currentPage === 'images') {
      const slideInterval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % birthdayImages.length)
      }, 4000) // Change image every 4 seconds

      return () => clearInterval(slideInterval)
    }
  }, [currentPage, birthdayImages.length])

  // Initialize audio when poem page opens
  useEffect(() => {
    if (currentPage === 'poem' && !audioElement) {
      const audio = new Audio()
      audio.src = "/Khalid_-_Better_ScaryBeatz.com.mp3"
      audio.loop = true
      audio.volume = 0.5
      setAudioElement(audio)
      
      // Auto-play the song when poem page opens
      const playAudio = async () => {
        try {
          await audio.play()
          setIsPlaying(true)
        } catch (error) {
          console.log("Auto-play failed, user interaction required:", error)
        }
      }
      
      playAudio()
    }
  }, [currentPage, audioElement])

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

  const nextPage = () => {
    if (currentPage === 'countdown') {
      setCurrentPage('poem')
    } else if (currentPage === 'poem') {
      setCurrentPage('message')
    } else if (currentPage === 'message') {
      setCurrentPage('images')
    }
  }

  // Countdown Screen
  if (currentPage === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #6495ED 0%, #FFF9F0 50%, #6495ED 100%)'}}>
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
                {/* <p className="text-lg md:text-xl opacity-90 font-medium">Kenya Time (EAT)</p> */}

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="bg-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                    <div className="text-3xl md:text-4xl font-bold text-black">00</div>
                    <div className="text-sm md:text-base opacity-80 font-medium text-black">Hours</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                    <div className="text-3xl md:text-4xl font-bold text-black">00</div>
                    <div className="text-sm md:text-base opacity-80 font-medium text-black">Minutes</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                    <div className="text-3xl md:text-4xl font-bold text-black">00</div>
                    <div className="text-sm md:text-base opacity-80 font-medium text-black">Seconds</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={nextPage}
                className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full transform hover:scale-105 transition-all duration-300 text-lg"
              >
                <Sparkles className="mr-2" size={24} />
                Reveal the Magic!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Poem Screen
  if (currentPage === 'poem') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #6495ED 0%, #FFF9F0 30%, #6495ED 70%, #FFF9F0 100%)'}}>
        
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

        <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-screen">
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 shadow-2xl max-w-2xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">✨ A Poem for You ✨</h1>
              </div>
              
              <div className="text-black/95 leading-relaxed whitespace-pre-line text-center text-sm md:text-base max-h-96 overflow-y-auto mb-8">
                {birthdayPoem}
              </div>

              <div className="text-center">
                <Button
                  onClick={nextPage}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transform hover:scale-105 transition-all duration-300"
                >
                  Continue to Message
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Message Screen
  if (currentPage === 'message') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #6495ED 0%, #FFF9F0 30%, #6495ED 70%, #FFF9F0 100%)'}}>
        
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

        <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-screen">
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">❤️ Happy Birthday June Daah! ❤️</h1>
              </div>

              <div className="text-center space-y-6">
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
                
                <p className="text-base md:text-lg text-black/90 font-medium mb-8">
                  Happy Birthday, June Daah.
                  Never stop being your soft, beautiful self. 🌸
                </p>

                <Button
                  onClick={nextPage}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transform hover:scale-105 transition-all duration-300"
                >
                  See Your Special Images
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Images Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #6495ED 0%, #FFF9F0 30%, #6495ED 70%, #FFF9F0 100%)'}}>
      
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
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">🎉 Your Beautiful Memories 🎉</h1>
          <p className="text-xl md:text-2xl text-black/90 font-medium">Celebrating all the wonderful moments! 📸</p>
        </div>

        {/* Image Slideshow */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="relative h-96 md:h-[600px] overflow-hidden">
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
        </div>

        {/* Final Message */}
        <div className="text-center mt-8">
          <Card className="bg-white/15 backdrop-blur-lg border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-black mb-4">🎊 May Your Day Be Magical! 🎊</h3>
              <p className="text-lg text-black/90">
                Hope this birthday surprise brought a smile to your face, June Daah! 
                You deserve all the happiness in the world. 💖
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}