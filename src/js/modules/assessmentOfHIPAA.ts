export function assessmentOfHIPAA() {
  const root = document.querySelector('.hipaa-assessment_active');

  let currentQuestion = 0;

  const resultUrlRoot = 'https://zenzap.webflow.io/';
  const resultUrlSuccess = 'hipaa-risk-assessment-results-is-in-great-shape';
  const resultUrlWarning = 'hipaa-risk-assessment-results-has-compliance-gaps';
  const resultUrlError = 'hipaa-risk-assessment-results-has-serious-risk';

  const questions = [
    'We have a signed BAA with every vendor that handles PHI - not just our EHR vendor.',
    'Clinical staff communicate about patients exclusively on a platform our organization owns and controls.',
    "We can immediately cut off a staff member's access to all messages, files, and media when they leave.",
    'All team communication data is stored in business-controlled cloud storage - not on personal devices.',
    'Our communication platform integrates with our EHR, and all integrations are covered under a BAA.',
    'We can produce a full audit log of internal communications if requested by OCR.',
    'We have a documented breach response plan, and our team knows what to do in the first 72 hours.',
    'All staff complete role-specific HIPAA communication training, and completion is documented individually.',
    'We have a written mobile device policy covering personal devices used for work - including which apps are permitted and prohibited.',
    'Every location operates under the same communication policies and uses the same approved platform.',
  ];

  const answers: boolean[] = [];

  if (root) {
    const progressEl = root.querySelector<HTMLElement>('[data-progress]');
    const questionEl = root.querySelector<HTMLElement>('[data-question]');
    const indicatorEl = root.querySelector<HTMLElement>('[data-question-indicator]');

    const openTriggers = document.querySelectorAll('[data-hipaa-trigger');

    if (openTriggers.length) {
      openTriggers.forEach((btn) => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          document.querySelector('.hipaa-assessment_inactive')?.classList.add('hidden');
          document.querySelector('.hipaa-assessment_active')?.classList.remove('hidden');
        });
      });
    }
    let indicators: NodeListOf<HTMLElement>;

    const render = () => {
      if (!progressEl || !questionEl) return;

      progressEl.textContent = `QUESTION ${currentQuestion + 1} OF ${questions.length}`;

      questionEl.textContent = questions[currentQuestion];

      if (indicatorEl) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < questions.length; i++) {
          const clone = indicatorEl.cloneNode(true) as HTMLElement;

          clone.dataset.index = String(i);

          fragment.appendChild(clone);
        }

        indicatorEl.replaceWith(fragment);

        indicators = document.querySelectorAll<HTMLElement>('[data-question-indicator]');

        if (indicators.length && currentQuestion === 0) {
          indicators[0].classList.add('is-active');
        }
      }
    };

    root.querySelectorAll<HTMLElement>('[data-answer]').forEach((button) => {
      button.addEventListener('click', () => {
        answerQuestion(button.dataset.answer === 'yes');
      });
    });

    const finish = () => {
      const yesCount = answers.filter(Boolean).length;
      const yesIndices = answers
        .map((answer, index) => (answer ? index : null))
        .filter((index) => index !== null) as number[];

      const quizData = {
        answers,
        yesCount,
        yesIndices,
        totalQuestions: questions.length,
      };

      sessionStorage.setItem('quizData', JSON.stringify(quizData));

      let redirectUrl;
      if (quizData.yesCount === 10) {
        redirectUrl = `${resultUrlRoot}${resultUrlSuccess}`;
      } else if (quizData.yesCount >= 7) {
        redirectUrl = `${resultUrlRoot}${resultUrlWarning}`;
      } else {
        redirectUrl = `${resultUrlRoot}${resultUrlError}`;
      }

      window.location.href = redirectUrl;
    };

    const answerQuestion = (answer: boolean) => {
      answers.push(answer);
      currentQuestion++;

      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('is-active', index === currentQuestion);
      });

      if (currentQuestion >= questions.length) {
        finish();
        return;
      }

      render();
    };

    render();
  }
  const renderResult = (): void => {
    const templateItem = document.querySelector<HTMLElement>('[data-result-q-wrap]');

    if (!templateItem || !questions.length) return;

    // Get quiz data from sessionStorage
    const quizDataStr = sessionStorage.getItem('quizData');
    if (!quizDataStr) return;

    const quizData = JSON.parse(quizDataStr) as {
      answers: boolean[];
      yesCount: number;
      yesIndices: number[];
      totalQuestions: number;
    };

    const fragment = document.createDocumentFragment();

    const totalQ = document.querySelector<HTMLElement>('[q-total]');
    const totalQinPlace = document.querySelector<HTMLElement>('[q-in-place]');
    const qGaps = document.querySelector<HTMLElement>('[q-gaps]');

    if (totalQ) {
      totalQ.innerHTML = quizData.totalQuestions.toString();
    }
    if (totalQinPlace) {
      totalQinPlace.innerHTML = quizData.yesCount.toString();
    }

    if (qGaps) {
      const gaps = quizData.totalQuestions - quizData.yesCount;
      qGaps.innerHTML = gaps.toString();
    }

    questions.forEach((question: string, index: number) => {
      const clone = templateItem.cloneNode(true) as HTMLElement;
      clone.dataset.index = String(index);

      const qText = clone.querySelector<HTMLElement>('[data-result-q-text]');
      if (qText) {
        qText.textContent = question;
      }

      // Mark if this question was answered with Yes
      if (quizData.yesIndices.includes(index)) {
        clone.dataset.answered = 'yes';
        clone.classList.add('is-answered');
      }

      fragment.appendChild(clone);
    });

    templateItem.replaceWith(fragment);
  };

  renderResult();

  return {
    getAnswers: () => answers,
    getScore: () => answers.filter(Boolean).length,
  };
}
