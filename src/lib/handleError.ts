import { toast } from '@/components/ui/use-toast';

export const handleError = (message: string) => {
  console.error(message);
  toast({
    variant: 'destructive',
    title: 'Error',
    description: message,
  });
};
