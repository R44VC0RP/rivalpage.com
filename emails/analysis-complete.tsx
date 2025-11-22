import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Button,
} from '@react-email/components';

interface AnalysisCompleteEmailProps {
  firstName?: string;
  domain?: string;
  competitorCount?: number;
  analysisUrl?: string;
  companyName?: string;
}

export const AnalysisCompleteEmail = ({
  firstName = 'there',
  domain = 'example.com',
  competitorCount = 4,
  analysisUrl = 'https://rivalpage.com/analysis/example.com',
  companyName = 'RivalPage',
}: AnalysisCompleteEmailProps) => {
  const previewText = `Your competitor analysis for ${domain} is ready`;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrX2B4qb1w2wX7DPI.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrX2B4qb1w2wX7DPI.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body
          className="mx-auto my-auto px-2"
          style={{
            backgroundColor: '#f5f5f5',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, Arial, sans-serif',
          }}
        >
          <Container className="mx-auto my-[24px] max-w-[600px]">
            <Section
              className="rounded-[12px] border border-solid bg-white"
              style={{ borderColor: '#E5E5E5' }}
            >
              <Section className="p-[24px]">
                {/* Logo/Header */}
                <Section className="mb-[20px]">
                  <Heading 
                    className="m-0 p-0 text-[24px] font-bold" 
                    style={{ color: '#4701FF', fontFamily: 'Inter, sans-serif' }}
                  >
                    {companyName}
                  </Heading>
                </Section>

                {/* Main Content */}
                <Heading 
                  className="mt-0 mb-[12px] p-0 text-[20px] font-semibold" 
                  style={{ color: '#4701FF' }}
                >
                  Your analysis is ready! 🎉
                </Heading>

                <Text 
                  className="mt-0 mb-[16px] text-[15px] leading-[1.6]" 
                  style={{ color: '#696969' }}
                >
                  Hi {firstName}, we've finished analyzing <span className="font-semibold" style={{ color: '#4701FF' }}>{domain}</span> and found {competitorCount} competitors with detailed insights and screenshots.
                </Text>

                <Text 
                  className="mt-0 mb-[20px] text-[15px] leading-[1.6]" 
                  style={{ color: '#696969' }}
                >
                  Click below to view your complete competitor analysis:
                </Text>

                {/* CTA Button */}
                <Section className="my-[24px]">
                  <Button
                    href={analysisUrl}
                    style={{
                      backgroundColor: '#4701FF',
                      color: '#FFFFFF',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block',
                      fontSize: '15px',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    View Analysis →
                  </Button>
                </Section>

                <Text 
                  className="mt-[16px] mb-0 text-[13px]" 
                  style={{ color: '#A0A0A0' }}
                >
                  Or copy this link:{' '}
                  <Link 
                    href={analysisUrl} 
                    className="no-underline break-all" 
                    style={{ color: '#4701FF' }}
                  >
                    {analysisUrl}
                  </Link>
                </Text>

                <Hr 
                  className="mx-0 my-[24px] w-full border border-solid" 
                  style={{ borderColor: '#E5E5E5' }} 
                />

                {/* Footer */}
                <Text 
                  className="mt-0 mb-0 text-[12px] leading-[1.6]" 
                  style={{ color: '#A0A0A0' }}
                >
                  You received this email because you requested a competitor analysis at {companyName}.
                </Text>
                
                <Text 
                  className="mt-[8px] mb-0 text-[12px]" 
                  style={{ color: '#A0A0A0' }}
                >
                  © {new Date().getFullYear()} {companyName}. All rights reserved.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

AnalysisCompleteEmail.PreviewProps = {
  firstName: 'Jane',
  domain: 'example.com',
  competitorCount: 4,
  analysisUrl: 'https://rivalpage.com/analysis/example.com',
  companyName: 'RivalPage',
} as AnalysisCompleteEmailProps;

export default AnalysisCompleteEmail;

