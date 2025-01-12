import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

type InfoCardProps = {
    children: React.ReactNode;
    content: string;
};

export default function InfoCard({ children, content }: InfoCardProps) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent>{content}</HoverCardContent>
        </HoverCard>
    );
}
