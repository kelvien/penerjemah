'use client'

import { useEffect, useState, useCallback } from 'react';
import { AudioConfig, ProfanityOption, SpeechConfig, SpeechTranslationConfig, TranslationRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { ArrowsRightLeftIcon, PlayIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/20/solid'

const enum Language {
  EN = 0,
  ID
}

const translationMap = {
  [Language.EN]: {
    stt: 'en-us',
    t: 'en',
    icon: '🇺🇸'
  },
  [Language.ID]: {
    stt: 'id-id',
    t: 'id',
    icon: '🇮🇩'
  }
};

const timeout = 5000;

export default function Home() {
  const [recognizer, setRecognizer] = useState<TranslationRecognizer>();
  const [sourceLanguage, setSourceLanguage] = useState<Language>(Language.EN);
  const [sourceOffset, setSourceOffset] = useState<number>();
  const [targetLanguage, setTargetLanguage] = useState<Language>(Language.ID);
  const [sourceResult, setSourceResult] = useState('');
  const [targetResult, setTargetResult] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>();
  const [speechConfig, setSpeechConfig] = useState<SpeechConfig>();

  const loadTranslator = useCallback((sourceLanguage: Language, targetLanguage: Language) => {
    const sc = SpeechTranslationConfig.fromSubscription(process.env.NEXT_PUBLIC_SPEECH_KEY || '', process.env.NEXT_PUBLIC_SPEECH_REGION || '');
    sc.setProfanity(ProfanityOption.Masked);
    sc.speechRecognitionLanguage = translationMap[sourceLanguage].stt;
    sc.addTargetLanguage(translationMap[targetLanguage].t);
    const ac = AudioConfig.fromDefaultMicrophoneInput();
    const rec = new TranslationRecognizer(sc, audioConfig);
    rec.recognizing = (_sender, event) => {
      setSourceOffset(event.offset);
      setSourceResult(event.result.text);
      setTargetResult(event.result.translations.get(translationMap[targetLanguage].t));
    }; 
    setRecognizer(rec);
    setAudioConfig(ac);
    setSpeechConfig(sc);
  }, []);

  useEffect(() => {
    loadTranslator(sourceLanguage, targetLanguage);
  }, []);

  useEffect(() => {
    if (!isStarted) {
      loadTranslator(sourceLanguage, targetLanguage);
    }
  }, [isStarted]);

  const startTranslation = () => {
    recognizer?.startContinuousRecognitionAsync();
    setIsStarted(true);
  };

  const stopTranslation = async () => {
    audioConfig?.close();
    speechConfig?.close();
    recognizer?.stopContinuousRecognitionAsync(() => {
      recognizer?.close(() => {
        setIsStarted(false);
      });
    });
    setRecognizer(undefined);
    setAudioConfig(undefined);
    setSpeechConfig(undefined);
  };

  useEffect(() => {
    setSourceResult('');
    setTargetResult('');
  }, [isStarted]);

  const switchLanguage = (currentSourceLanguage: Language, currentTargetLanguage: Language) => {
    stopTranslation();
    setSourceLanguage(currentTargetLanguage);
    setTargetLanguage(currentSourceLanguage);
    loadTranslator(currentTargetLanguage, currentSourceLanguage);
  };

  return (<>
    <div className="flex justify-between">
      {!isStarted ? <a href="#" onClick={startTranslation}><PlayIcon className="h-4 w-4"/></a> : <a href="#" onClick={stopTranslation}><StopIcon className="h-4 w-4"/></a>}
      <a href="#" onClick={() => switchLanguage(sourceLanguage, targetLanguage)}><ArrowsRightLeftIcon className="h-4 w-4"/></a>
    </div>
    <main className="flex min-h-screen flex-col items-center justify-between content-around p-24">
      <div className="result-box">
        <div className="lang-box">
          <div className="flex items-center">
            <span>{translationMap[sourceLanguage].icon}</span>
            <span className='ml-2'><SpeakerWaveIcon className="h-4 w-4" /></span>
          </div>
        </div>
        {sourceResult}
      </div>
      <div className="result-box">
      <div className="lang-box">{translationMap[targetLanguage].icon}</div>
        {targetResult}
      </div>
    </main>
  </>)
}
