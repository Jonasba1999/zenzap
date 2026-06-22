export function assessmentOfHIPAA() {
  const root = document.querySelector('.hipaa-assessment_active');

  let currentQuestion = 0;

  const resultUrlRoot = window.location.origin;
  const resultUrlSuccess = '/hipaa-risk-assessment-results-is-in-great-shape';
  const resultUrlWarning = '/hipaa-risk-assessment-results-has-compliance-gaps';
  const resultUrlError = '/hipaa-risk-assessment-results-has-serious-risk';

  const questions = [
    {
      question:
        'We have a signed BAA with every vendor that handles PHI - not just our EHR vendor.',
      description:
        'Review annually and whenever you add a new vendor, change a service, or onboard a new communication platform.',
      requirement:
        'Every vendor that handles PHI on your behalf must have a signed BAA with your organization.',
      problem:
        'Without a signed BAA, using any communication tool for conversations that include patient data is a HIPAA violation, regardless of its technical security features. ',
      solution:
        'The ability to get a BAA signed with your communication platform before your team sends a single message.',
    },
    {
      question:
        'Clinical staff communicate about patients exclusively on a platform our organization owns and controls.',
      description:
        'Revisit whenever you hire agency staff, locum physicians, or contractors who may default to personal apps.',
      requirement:
        'All internal communication about patients must happen on platforms your organization owns and controls.',
      problem:
        'Staff using personal messaging apps means PHI is being shared in apps your organization has no admin access to, with no audit trail and no way to retrieve it.',
      solution:
        "The ability to move your whole team onto a compliant platform that's as easy to use as the personal messaging apps they're already on and enforce them using it.",
    },
    {
      question:
        "We can immediately cut off a staff member's access to all messages, files, and media when they leave.",
      description:
        'Test periodically to confirm access removal is instant and complete across every location.',
      requirement:
        'Former employees must lose access to all PHI and internal communications immediately upon leaving the organization.',
      problem:
        'When staff leave, their access to patient conversations, files, and clinical data remains active on their personal devices with no way for your organization to revoke it.',
      solution:
        'The ability to remove a staff member from every chat, file, and contact in one click.',
    },
    {
      question:
        'All team communication data is stored in business-controlled cloud storage - not on personal devices.',
      description:
        'Audit whenever new devices are introduced or your mobile device policy changes.',
      requirement:
        'All PHI must be stored in business-controlled cloud storage, not on personal devices.',
      problem:
        'Messages, wound photos, and patient files shared through personal messaging apps are saved permanently to personal devices your organization has no legal right to access.',
      solution:
        "The ability to ensure all communications and files are stored in the cloud under your organization's control, never in anyone's camera roll.",
    },
    {
      question:
        'Our communication platform integrates with our EHR, and all integrations are covered under a BAA.',
      description:
        'Review integration coverage whenever you change EMR vendors or add new clinical workflows.',
      requirement:
        'Communication systems must be connected to reduce workarounds that create compliance gaps.',
      problem:
        'When your communication platform and EMR are disconnected, staff create workarounds - sharing patient information outside approved channels to get their work done.',
      solution:
        'The ability to integrate your communication platform natively with your EMR so patient updates, lab results, and clinical alerts flow automatically into the right chat.',
    },
    {
      question: 'We can produce a full audit log of internal communications if requested by OCR.',
      description:
        'Run a test retrieval at least once a year so you know exactly what it produces and how long it takes if OCR asks.',
      requirement:
        'Your organization must be able to produce a complete audit log of internal communications if OCR requests one.',
      problem:
        'If your team communicates over personal messaging apps, there is no audit log to produce. If OCR investigates, you have nothing to show.',
      solution:
        'The ability to generate a full audit log of every message, file, and communication across your entire organization on demand.',
    },
    {
      question:
        'We have a documented breach response plan, and our team knows what to do in the first 72 hours.',
      description:
        'Run a tabletop exercise annually to make sure your team knows what to do in the first 72 hours of a suspected breach.',
      requirement:
        'Your organization must have a documented breach response plan and know what to do within 72 hours of a suspected breach.',
      problem:
        'Without a compliant communication platform, you have no audit trail to work from, making it nearly impossible to respond to a breach quickly or demonstrate what happened.',
      solution:
        'The ability to access a complete communication history immediately when an incident occurs, so your response is fast and your documentation is complete.',
    },
    {
      question:
        'All staff complete role-specific HIPAA communication training, and completion is documented individually.',
      description: 'Update training materials whenever policies, systems, or regulations change.',
      requirement:
        'HIPAA training must be documented at the individual level, not just completed annually. ',
      problem:
        'Problem: Annual training sessions with no individual records on file are a liability. If OCR asks for proof of training, undocumented sessions offer no protection. ',
      solution:
        'The ability to distribute compliance updates and policy announcements through a platform that tracks who received them and when.',
    },
    {
      question:
        'We have a written mobile device policy covering personal devices used for work - including which apps are permitted and prohibited.',
      description:
        'Revisit whenever staff bring new personal devices into clinical workflows or new apps become popular.',
      requirement:
        'Your organization must have a documented policy covering which apps are permitted on personal devices used for work, and enforce it.',
      problem:
        'Without a compliant work communication platform, staff have no approved alternative to personal messaging apps, making any mobile device policy effectively unenforceable.',
      solution:
        'The ability to give staff a compliant mobile-first work chat that removes the need to use personal messaging apps for clinical communication.',
    },
    {
      question:
        'Every location operates under the same communication policies and uses the same approved platform.',
      description:
        'Audit consistency across sites whenever you open a new location or onboard new management.',
      requirement:
        'Every location in your organization must follow the same communication policies and use the same approved platform consistently.',
      problem:
        'If one location is using personal messaging apps while others are on a compliant platform, your organization is still exposed. Inconsistency across sites is itself a compliance gap.',
      solution:
        'The ability to organize your entire organization by location and enforce consistent communication standards across every site.',
    },
  ];

  type QuestionItem = {
    question: string;
    description: string;
    requirement: string;
    problem: string;
    solution: string;
  };

  type QuizData = {
    answers: boolean[];
    yesCount: number;
    yesIndices: number[];
    totalQuestions: number;
    shareUrl: string;
  };

  const answers: boolean[] = [];

  if (root) {
    const progressEl = root.querySelector<HTMLElement>('[data-progress]');
    const btnPrev = root.querySelector<HTMLElement>('[data-prev-question]');
    const questionEl = root.querySelector<HTMLElement>('[data-question]');
    const indicatorEl = root.querySelector<HTMLElement>('[data-question-indicator]');

    const openTriggers = document.querySelectorAll<HTMLElement>('[data-hipaa-trigger');

    if (openTriggers.length) {
      openTriggers.forEach((btn) => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          document.querySelector('.hipaa-assessment_inactive')?.classList.add('hidden');
          document.querySelector('.hipaa-assessment_active')?.classList.remove('hidden');

          openTriggers.forEach((b) => {
            b.style.display = 'none';
          });
        });
      });
    }
    let indicators: NodeListOf<HTMLElement>;

    const render = () => {
      if (!progressEl || !questionEl) return;

      progressEl.textContent = `QUESTION ${currentQuestion + 1} OF ${questions.length}`;

      questionEl.textContent = questions[currentQuestion].question;

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

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentQuestion > 0) {
          currentQuestion--;

          answers.pop();

          if (currentQuestion === 0) {
            btnPrev.classList.add('disabled');
          }
          indicators.forEach((indicator, index) => {
            indicator.classList.toggle('is-active', index === currentQuestion);
          });

          render();
        }
      });
    }

    const finish = () => {
      const answerSlice = answers.slice(0, questions.length);
      const yesCount = answerSlice.filter(Boolean).length;
      const yesIndices = answerSlice
        .map((answer, index) => (answer ? index : null))
        .filter((index) => index !== null) as number[];

      let redirectUrl;

      const answersParam = answers.map((a) => (a ? 1 : 0)).join('');

      if (yesCount === 10) {
        redirectUrl = `${resultUrlRoot}${resultUrlSuccess}`;
      } else if (yesCount >= 7) {
        redirectUrl = `${resultUrlRoot}${resultUrlWarning}`;
      } else {
        redirectUrl = `${resultUrlRoot}${resultUrlError}`;
      }

      const shareUrl = `${redirectUrl}?a=${answersParam}`;

      const quizData = {
        answers,
        yesCount,
        yesIndices,
        totalQuestions: questions.length,
        shareUrl: shareUrl,
      };

      sessionStorage.setItem('quizData', JSON.stringify(quizData));

      window.location.href = redirectUrl;
    };

    const answerQuestion = (answer: boolean) => {
      answers.push(answer);

      if (btnPrev) {
        btnPrev.classList.remove('disabled');
      }
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

  const getQuizData = () => {
    const params = new URLSearchParams(window.location.search);
    const answersParam = params.get('a');

    // Shared URL
    if (answersParam) {
      const answers = answersParam.split('').map((char) => char === '1');

      const yesIndices = answers
        .map((answer, index) => (answer ? index : null))
        .filter((index) => index !== null) as number[];

      return {
        answers,
        yesCount: yesIndices.length,
        yesIndices,
        totalQuestions: answers.length,
      };
    }

    // Normal flow
    const stored = sessionStorage.getItem('quizData');

    if (!stored) return null;

    return JSON.parse(stored);
  };

  const getShareUrl = (): string | null => {
    const quizDataStr = sessionStorage.getItem('quizData');

    if (!quizDataStr) {
      return null;
    }

    const quizData = JSON.parse(quizDataStr) as QuizData;

    return quizData.shareUrl ?? null;
  };

  const renderResult = (): void => {
    const templateItem = document.querySelector<HTMLElement>('[data-result-q-wrap]');

    const isInPlaceIcon = document.querySelector<HTMLElement>('[data-controls-in-place="yes"]');
    const isNotInPlaceIcon = document.querySelector<HTMLElement>('[data-controls-in-place="no"]');

    if (!templateItem || !questions.length) return;

    const quizData = getQuizData();

    if (!quizData) return;

    const fragment = document.createDocumentFragment();

    const totalQ = document.querySelector<HTMLElement>('[q-total]');
    const totalQinPlace = document.querySelector<HTMLElement>('[q-in-place]');
    const qGaps = document.querySelector<HTMLElement>('[q-gaps]');

    const shareButton = document.querySelector<HTMLElement>('[data-share-report-url]');
    const shareUrl = getShareUrl();

    if (totalQ) {
      totalQ.innerHTML = quizData.totalQuestions.toString();
    }
    if (totalQinPlace) {
      totalQinPlace.innerHTML = quizData.yesCount.toString();

      if (quizData.yesCount > 0) {
        isInPlaceIcon?.classList.remove('hidden');
        isNotInPlaceIcon?.classList.add('hidden');
      }
    }

    if (qGaps) {
      const gaps = Math.max(0, quizData.totalQuestions - quizData.yesCount);
      qGaps.innerHTML = gaps.toString();
    }

    questions.forEach((item: QuestionItem, index: number) => {
      const clone = templateItem.cloneNode(true) as HTMLElement;
      clone.dataset.index = String(index);

      const qText = clone.querySelector<HTMLElement>('[data-result-q-text]');
      if (qText) {
        qText.textContent = item.question;
      }

      // Mark if this question was answered with Yes
      if (quizData.yesIndices.includes(index)) {
        clone.dataset.answered = 'yes';
        clone.classList.add('is-answered');
      }

      // Remove positive values from screen
      const positiveWrap = document.querySelector<HTMLElement>('[data-result="positive"]');
      if (clone.dataset.answered === 'yes' && !positiveWrap) {
        const itemWrap = clone?.closest<HTMLElement>('[data-result-q-wrap]');

        if (itemWrap) {
          itemWrap.style.display = 'none';
        }
      }

      // Only for serious risk - show recommendations

      const descriptionElement = clone.querySelector<HTMLElement>('[data-result-description-text]');
      const requirementElement = clone.querySelector<HTMLElement>('[data-result-requirement-text]');
      const problemElement = clone.querySelector<HTMLElement>('[data-result-problem-text]');
      const solutionElement = clone.querySelector<HTMLElement>('[data-result-solution-text]');

      if (descriptionElement) {
        descriptionElement.innerText = item.description;
      }
      if (requirementElement) {
        requirementElement.textContent = item.requirement;
      }
      if (problemElement) {
        problemElement.textContent = item.problem;
      }
      if (solutionElement) {
        solutionElement.textContent = item.solution;
      }

      fragment.appendChild(clone);
    });

    if (shareButton && shareUrl) {
      (shareButton as HTMLAnchorElement).href = shareUrl;

      const originalText = shareButton.textContent;

      shareButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText(shareUrl);

        const textDiv = shareButton.querySelector('div');
        if (textDiv) {
          textDiv.textContent = 'Copied!';

          setTimeout(() => {
            textDiv.textContent = originalText;
          }, 2000);
        }
      });
    }

    templateItem.replaceWith(fragment);
  };

  renderResult();

  return {
    getAnswers: () => answers,
    getScore: () => answers.filter(Boolean).length,
  };
}
