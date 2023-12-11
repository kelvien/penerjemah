'use client'

import { useEffect, useState, useCallback } from 'react';
import { AudioConfig, PhraseListGrammar, ProfanityOption, SpeechTranslationConfig, TranslationRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { ArrowsRightLeftIcon, PlayIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid'

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

  const loadTranslator = useCallback((sourceLanguage: Language, targetLanguage: Language) => {
    const speechConfig = SpeechTranslationConfig.fromSubscription(process.env.NEXT_PUBLIC_SPEECH_KEY || '', process.env.NEXT_PUBLIC_SPEECH_REGION || '');
    speechConfig.setProfanity(ProfanityOption.Masked);
    speechConfig.speechRecognitionLanguage = translationMap[sourceLanguage].stt;
    speechConfig.addTargetLanguage(translationMap[targetLanguage].t);

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new TranslationRecognizer(speechConfig, audioConfig);
    recognizer.recognizing = (_sender, event) => {
      setSourceOffset(event.offset);
      setSourceResult(event.result.text);
      setTargetResult(event.result.translations.get(translationMap[targetLanguage].t));
    }; 

    setRecognizer(recognizer);
  }, []);

  useEffect(() => {
    loadTranslator(sourceLanguage, targetLanguage);
  }, []);

  const startTranslation = useCallback(() => {
    recognizer?.startContinuousRecognitionAsync();
    setIsStarted(true);
  }, [recognizer]);

  const stopTranslation = useCallback(() => {
    recognizer?.stopContinuousRecognitionAsync();
    recognizer?.close();
    setIsStarted(false);
  }, [recognizer]);

  useEffect(() => {
    setSourceResult('');
    setTargetResult('');
  }, [isStarted]);

  const switchLanguage = useCallback((currentSourceLanguage: Language, currentTargetLanguage: Language) => {
    stopTranslation();
    const targetLanguage = currentSourceLanguage;
    setSourceLanguage(currentTargetLanguage);
    setTargetLanguage(targetLanguage);
    loadTranslator(currentTargetLanguage, targetLanguage);
  }, []);

  return (<>
    <div className="flex justify-between">
      {!isStarted ? <a href="#" onClick={startTranslation}><PlayIcon className="h-6 w-6"/></a> : <a href="#" onClick={stopTranslation}><StopIcon className="h-6 w-6"/></a>}
      <a href="#" onClick={() => switchLanguage(sourceLanguage, targetLanguage)}><ArrowsRightLeftIcon className="h-6 w-6"/></a>
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
