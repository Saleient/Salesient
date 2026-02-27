import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";

type EmailTemplateProps = {
  otp: string;
  magicLink?: string;
};

export function EmailTemplate({ otp, magicLink }: EmailTemplateProps) {
  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Login to Salesient</Heading>

          {magicLink && (
            <Link href={magicLink} style={link} target="_blank">
              Click here to log in with this magic link
            </Link>
          )}

          <Text style={text}>
            Or, copy and paste this temporary login code:
          </Text>

          <code style={code}>{otp}</code>

          <Text style={hint}>
            If you didn't try to login, you can safely ignore this email.
          </Text>

          <Text style={hint}>
            Tip: You can manage your account settings after logging in.
          </Text>

          <Section style={footer}>
            <Text style={footerText}>
              <Link href="https://salesorbit.com" style={text} target="_blank">
                Salesient
              </Link>
              , your AI-powered sales intelligence platform
              <br />
              for notes, tasks, and knowledge management.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
};

const container = {
  maxWidth: "37.5em",
  paddingRight: "12px",
  paddingLeft: "12px",
  marginRight: "auto",
  marginLeft: "auto",
};

const h1 = {
  color: "#333333",
  fontSize: "24px",
  marginBottom: "40px",
  marginTop: "40px",
  marginRight: "0",
  marginLeft: "0",
  padding: "0",
};

const link = {
  color: "#2754c5",
  textDecorationLine: "underline",
  fontSize: "14px",
  marginBottom: "16px",
  display: "block",
};

const text = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#333333",
  marginBottom: "14px",
  marginTop: "24px",
};

const code = {
  display: "inline-block",
  paddingBottom: "16px",
  paddingTop: "16px",
  paddingRight: "4.5%",
  paddingLeft: "4.5%",
  width: "90%",
  backgroundColor: "#f4f4f4",
  borderRadius: "0.375rem",
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: "#eeeeee",
  color: "#333333",
  fontSize: "16px",
  fontWeight: "600",
  letterSpacing: "0.5px",
};

const hint = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#ababab",
  marginTop: "14px",
  marginBottom: "16px",
};

const footer = {
  marginTop: "38px",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "22px",
  color: "#898989",
  marginTop: "12px",
  marginBottom: "24px",
};

const footerLink = {
  color: "#898989",
  textDecorationLine: "underline",
  fontSize: "14px",
};
