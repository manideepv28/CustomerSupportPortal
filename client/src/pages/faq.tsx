import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FAQ } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, HelpCircle, MessageSquare, Bot } from "lucide-react";

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const { data: faqs = [] } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  const categories = [
    { id: "all", label: "All" },
    { id: "account", label: "Account" },
    { id: "billing", label: "Billing" },
    { id: "technical", label: "Technical" },
    { id: "features", label: "Features" },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === "" || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600">Find quick answers to common questions</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id}>
              <Collapsible
                open={openItems.has(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardContent className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 text-left">
                        {faq.question}
                      </h3>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          openItems.has(faq.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-6">Try searching with different keywords or browse all categories.</p>
            <Button variant="link" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          </div>
        )}

        {/* Still Need Help */}
        <Card className="mt-12 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
              <Button variant="outline">
                <Bot className="h-4 w-4 mr-2" />
                Chat with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
