// Commentary database - In a real app, this would be in a database
const commentaryDB = {
  // Kenya-related commentary
  'kenya': {
    'business': [
      "This development reflects Kenya's growing position as East Africa's financial hub, potentially attracting more international investment to the region.",
      "Kenya's business landscape continues to evolve, with this news highlighting the country's increasing integration with global markets.",
      "This business development could have significant implications for Kenya's economic growth trajectory and regional competitiveness."
    ],
    'politics': [
      "This political development in Kenya demonstrates the country's democratic maturity and could influence regional stability in East Africa.",
      "Kenya's political dynamics often serve as a bellwether for democratic progress across the African continent.",
      "This news underscores Kenya's role as a key player in East African politics and regional diplomatic initiatives."
    ],
    'technology': [
      "Kenya's tech sector continues to drive innovation across Africa, with this development potentially benefiting the broader East African tech ecosystem.",
      "This technological advancement reinforces Kenya's position as Africa's Silicon Savannah and could attract more tech investment to the region.",
      "Kenya's digital transformation efforts are increasingly positioning the country as a leader in African fintech and mobile innovation."
    ],
    'sports': [
      "Kenya's athletic prowess continues to inspire across Africa, reinforcing the country's legendary status in distance running.",
      "This sports achievement adds to Kenya's rich athletic heritage and could boost the country's international profile.",
      "Kenya's sporting success often translates into national pride and international recognition for East African athletics."
    ]
  },
  
  // Nigeria-related commentary  
  'nigeria': {
    'business': [
      "As Africa's largest economy, Nigeria's business developments often have continent-wide implications for trade and investment.",
      "This economic news from Nigeria could significantly impact West African markets and regional economic integration efforts.",
      "Nigeria's economic decisions frequently influence oil markets and African financial stability given the country's continental significance."
    ],
    'politics': [
      "Nigeria's political developments carry weight across West Africa, given the country's regional leadership role and population size.",
      "This political news reflects Nigeria's ongoing democratic evolution and could influence governance trends across anglophone Africa.",
      "As Africa's most populous nation, Nigeria's political decisions often set precedents for democratic processes continent-wide."
    ],
    'technology': [
      "Nigeria's tech ecosystem, particularly in fintech and e-commerce, continues to lead African digital innovation and attract global investment.",
      "This technological development reinforces Nigeria's position as a major African tech hub, potentially benefiting the entire West African region.",
      "Nigeria's digital economy growth could serve as a model for other African nations pursuing technology-driven economic transformation."
    ]
  },

  // South Africa-related commentary
  'south africa': {
    'business': [
      "South Africa's economic developments often influence the entire Southern African Development Community (SADC) region's financial markets.",
      "This business news from South Africa could impact the country's efforts to address unemployment and economic inequality challenges.",
      "As Africa's most industrialized economy, South Africa's business trends frequently set the tone for continental economic policies."
    ],
    'politics': [
      "South Africa's political landscape continues to evolve post-apartheid, with this development potentially affecting regional stability in Southern Africa.",
      "This political news reflects South Africa's ongoing transformation and could influence democratic governance across the African continent.",
      "South Africa's political decisions often carry weight in international African affairs and continental diplomatic initiatives."
    ]
  },

  // Egypt-related commentary
  'egypt': {
    'business': [
      "Egypt's economic developments are crucial for North African stability and the country's role as a bridge between Africa and the Middle East.",
      "This business news from Egypt could impact the Suez Canal revenues and regional trade flows between Europe, Asia, and Africa.",
      "Egypt's economic policies often influence North African markets and the country's strategic position in African continental trade."
    ],
    'politics': [
      "Egypt's political developments carry significant weight in Middle Eastern and North African geopolitics, affecting regional stability.",
      "This political news from Egypt could influence the country's role in African Union leadership and continental diplomatic initiatives.",
      "Egypt's political landscape affects both African and Middle Eastern regional dynamics, given the country's strategic geographic position."
    ]
  },

  // General commentary for other topics
  'general': [
    "This development highlights the interconnected nature of African economies and their growing integration with global markets.",
    "This news reflects broader trends in African governance, economic development, and international relations.",
    "This story demonstrates Africa's increasing importance in global affairs and international economic developments.",
    "This development could have significant implications for African continental integration and regional cooperation efforts.",
    "This news underscores the dynamic nature of African politics, economics, and social development in the 21st century."
  ]
};

export function generateCommentary(article, country, category) {
  try {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = title + ' ' + description;
    
    // Determine the most relevant commentary category
    let commentaryCategory = 'general';
    let countryKey = 'general';
    
    // Map country codes to commentary keys
    const countryMap = {
      'ke': 'kenya',
      'ng': 'nigeria', 
      'za': 'south africa',
      'eg': 'egypt'
    };
    
    if (country && countryMap[country]) {
      countryKey = countryMap[country];
    }
    
    // Detect category from content if not provided
    if (!category) {
      if (content.includes('business') || content.includes('economy') || content.includes('trade') || content.includes('market')) {
        commentaryCategory = 'business';
      } else if (content.includes('politic') || content.includes('government') || content.includes('election') || content.includes('president')) {
        commentaryCategory = 'politics';
      } else if (content.includes('tech') || content.includes('digital') || content.includes('innovation') || content.includes('startup')) {
        commentaryCategory = 'technology';
      } else if (content.includes('sport') || content.includes('athlete') || content.includes('football') || content.includes('soccer')) {
        commentaryCategory = 'sports';
      }
    } else {
      commentaryCategory = category;
    }
    
    // Get country-specific commentary first, fall back to general
    let commentary;
    if (commentaryDB[countryKey] && commentaryDB[countryKey][commentaryCategory]) {
      const options = commentaryDB[countryKey][commentaryCategory];
      commentary = options[Math.floor(Math.random() * options.length)];
    } else if (commentaryDB[countryKey] && commentaryDB[countryKey]['business']) {
      // Fall back to business category for the country
      const options = commentaryDB[countryKey]['business'];
      commentary = options[Math.floor(Math.random() * options.length)];
    } else {
      // Fall back to general commentary
      const options = commentaryDB.general;
      commentary = options[Math.floor(Math.random() * options.length)];
    }
    
    return {
      commentary,
      analysis: generateAnalysis(article, countryKey, commentaryCategory),
      impact: generateImpactStatement(countryKey, commentaryCategory)
    };
    
  } catch (error) {
    console.error('Error generating commentary:', error);
    return {
      commentary: "This development reflects the dynamic nature of African affairs and their global significance.",
      analysis: "This story highlights important trends in African development and international relations.",
      impact: "The implications of this news could extend beyond national borders to affect regional dynamics."
    };
  }
}

function generateAnalysis(article, country, category) {
  const analysisTemplates = {
    'kenya': {
      'business': "For Kenya's economy, this represents another step in the country's journey toward becoming East Africa's undisputed financial center.",
      'politics': "This political development in Kenya could influence the broader East African political landscape and regional stability.",
      'technology': "Kenya's position as Africa's Silicon Savannah continues to strengthen with developments like this."
    },
    'nigeria': {
      'business': "Given Nigeria's status as Africa's largest economy, this business development could have ripple effects across West African markets.",
      'politics': "Nigeria's political developments often set the tone for democratic processes across anglophone Africa.",
      'technology': "This tech advancement reinforces Nigeria's leadership in African fintech and digital innovation."
    },
    'south africa': {
      'business': "For South Africa's economy, this development comes at a crucial time as the country works to address structural economic challenges.",
      'politics': "This political news reflects South Africa's ongoing post-apartheid transformation and regional leadership role."
    },
    'egypt': {
      'business': "Egypt's strategic position between Africa and the Middle East makes this economic development particularly significant for regional trade.",
      'politics': "This political development in Egypt could influence both African and Middle Eastern regional dynamics."
    }
  };
  
  if (analysisTemplates[country] && analysisTemplates[country][category]) {
    return analysisTemplates[country][category];
  }
  
  return "This development highlights the interconnected nature of modern African affairs and their global implications.";
}

function generateImpactStatement(country, category) {
  const impactTemplates = {
    'business': "Economic analysts will be watching closely to see how this affects investor confidence and regional market stability.",
    'politics': "Political observers note that this could influence upcoming elections and policy decisions across the region.",
    'technology': "Tech industry experts believe this could accelerate digital transformation efforts across the African continent.",
    'sports': "Sports enthusiasts and industry professionals see this as potentially boosting Africa's profile in international athletics."
  };
  
  return impactTemplates[category] || "Experts across various fields will be monitoring the long-term implications of this development.";
}